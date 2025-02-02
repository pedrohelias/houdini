const donate_css = require('../../assets/stylesheets/donate-button/donate-button.v2.css');

const iframeHost = require('./details.js.erb')
  
  const windowAsAny = window as any;
  windowAsAny.commitchange = {
    iframes: []
  , modalIframe: null
  }
  const commitchange = windowAsAny.commitchange;
  commitchange.getParamsFromUrl = (allowlist:any) => {
      var result:any = {},
          tmp = [];
      var items = location.search.substr(1).split("&");
      for (var index = 0; index < items.length; index++) {
          tmp = items[index].split("=");
          if (allowlist.indexOf(tmp[0])) result[tmp[0]] = decodeURIComponent(tmp[1]);
      }
      return result;
  }
  
  commitchange.openDonationModal = (iframe:HTMLIFrameElement, overlay:HTMLElement) => {
    return (event:Event) => {
      overlay.className = 'commitchange-overlay commitchange-open'
      iframe.className = 'commitchange-iframe commitchange-open'

      commitchange.setParams(commitchange.getParamsFromButton(event.currentTarget), iframe)
  
      commitchange.open_iframe = iframe
      commitchange.open_overlay = overlay
    }
  }
  
  // Dynamically set the params of the appended iframe donate window
  commitchange.setParams = (params:any, iframe:HTMLIFrameElement) => {
    params.command = 'setDonationParams'
    params.sender = 'commitchange'
    iframe.contentWindow?.postMessage(JSON.stringify(params), fullHost)
  }
  
  commitchange.hideDonation = () => {
    if(!commitchange.open_overlay || !commitchange.open_iframe) return
    commitchange.open_overlay.className = 'commitchange-overlay commitchange-closed'
    commitchange.open_iframe.className = 'commitchange-iframe commitchange-closed'

    commitchange.open_overlay = undefined
    commitchange.open_iframe = undefined
  }
  
  const fullHost = iframeHost
  
  commitchange.overlay = () => {
    let div = document.createElement('div')
    div.setAttribute('class', 'commitchange-closed commitchange-overlay')
    return div
  }
  
  commitchange.createIframe = (source:string) => {
    let i = document.createElement('iframe')
    const url = document.location.href
    i.setAttribute('class', 'commitchange-closed commitchange-iframe')
    i.src = source + "&origin=" + url
    return i
  }
  
  // Given a button with a bunch of data parameters
  // return an object of key/vals corresponing to each param
  commitchange.getParamsFromButton = (elem:HTMLElement) => {
    let options: {[props:string]:any} = {
      offsite: 't'
    , type: elem.getAttribute('data-type')
    , custom_amounts: elem.getAttribute('data-custom-amounts') || elem.getAttribute('data-amounts')
    , amount: elem.getAttribute('data-amount')
    , minimal: elem.getAttribute('data-minimal')
    , weekly: elem.getAttribute('data-weekly')
    , default: elem.getAttribute('data-default')
    , custom_fields: elem.getAttribute('data-custom-fields')
    , campaign_id: elem.getAttribute('data-campaign-id')
    , gift_option_id: elem.getAttribute('data-gift-option-id')
    , redirect: elem.getAttribute('data-redirect')
    , designation: elem.getAttribute('data-designation')
    , multiple_designations: elem.getAttribute('data-multiple-designations')
    , hide_dedication: elem.getAttribute('data-hide-dedication')? true : false
    , designations_prompt: elem.getAttribute('data-designations-prompt')
    , single_amount: elem.getAttribute('data-single-amount')
    , designation_desc: elem.getAttribute('data-designation-desc') || elem.getAttribute('data-description')
    , locale: elem.getAttribute('data-locale')
    , "utm_source": elem.getAttribute('data-utm_source')
    , "utm_campaign": elem.getAttribute('data-utm_campaign')
    , "utm_medium": elem.getAttribute('data-utm_medium')
    , "utm_content": elem.getAttribute('data-utm_content')
    , "first_name": elem.getAttribute('data-first_name')
    , "last_name": elem.getAttribute('data-last_name')
    , "country": elem.getAttribute('data-country')
    , "postal_code": elem.getAttribute('data-postal_code')
  
  
    }
    // Remove false values from the options
    for(let key in options) {
      if(!options[key]) delete options[key]
    }
    return options
  }
  
  commitchange.appendMarkup = () => {
    if(commitchange.alreadyAppended) return
    else commitchange.alreadyAppended = true
    let script = document.getElementById('commitchange-donation-script') || document.getElementById('commitchange-script')
    const nonprofitID = script?.getAttribute('data-npo-id')
    const baseSource = fullHost + "/nonprofits/" + nonprofitID + "/donate"
    let elems = document.querySelectorAll('.commitchange-donate')
  
    for(let i = 0; i < elems.length; ++i) {
      let elem:any = elems[i]
      let source = baseSource
  
      
      const options = {
        offsite: "t",
        ...commitchange.getParamsFromUrl(["utm_campaign","utm_content","utm_source","utm_medium","first_name","last_name","country","postal_code","address","city"]),
        ...commitchange.getParamsFromButton(elem)
      }
      const params = new URLSearchParams(options);
  
      if(elem.hasAttribute('data-embedded')) {
        params.append("mode", "embedded");
        let iframe = commitchange.createIframe(new URL(baseSource + "&" + params.toString()).toString());
        elem.appendChild(iframe)
        iframe.setAttribute('class', 'commitchange-iframe-embedded')
        commitchange.iframes.push(iframe)
      } else {
        let overlay = commitchange.overlay()
        let iframe
        // Show the CommitChange-branded button if it's not set to custom.
        if(!elem.hasAttribute('data-custom') && !elem.hasAttribute('data-custom-button')) {
          let btn_iframe = document.createElement('iframe')
          let btn_src = fullHost + "/nonprofits/" + nonprofitID + "/btn"
          if(elem.hasAttribute('data-fixed')) { btn_src += '?fixed=t' }
          btn_iframe.src = btn_src
          btn_iframe.className = 'commitchange-btn-iframe'
          btn_iframe.setAttribute('scrolling', 'no')
          btn_iframe.setAttribute('seamless', 'seamless')
          elem.appendChild(btn_iframe)
          btn_iframe.onclick = commitchange.openDonationModal(iframe, overlay)
        }
        // Create the iframe overlay for this button
        let modal = document.createElement('div')
        modal.className = 'commitchange-modal'
        
        if(commitchange.modalIframe) {
          iframe = commitchange.modalIframe
        } else {
          iframe = commitchange.createIframe(source)
          commitchange.iframes.push(iframe)
          commitchange.modalIframe = iframe
        }
        modal.appendChild(overlay)
        document.body.appendChild(iframe)
        elem.parentNode.appendChild(modal)
        overlay.onclick = commitchange.hideDonation
        elem.onclick = commitchange.openDonationModal(iframe, overlay)
      } // end else
    } // end for loop
  }
  
  // Load the CSS for the parent page element from our AWS server
  commitchange.loadStylesheet = () => {
    if(commitchange.alreadyStyled) return
    else commitchange.alreadyStyled = true
    // let stylesheet = document.createElement('style')
    // stylesheet.rel  = 'stylesheet'
    // stylesheet.type = 'text/css'
    // stylesheet.innerText = donate_css
    // document.getElementsByTagName('head')[0].appendChild(stylesheet)
  }
  
  
  // Handle iframe post messages
  if(window.addEventListener) {
    window.addEventListener('message', (e) => {
      // Close the modal
      if(e.data === 'commitchange:close') {
        commitchange.hideDonation()
      } 
      // Redirect on donation completion using the redirect param
      else if(e.data.match(/^commitchange:redirect/)) {
        const matches = e.data.match(/^commitchange:redirect:(.+)$/)
        if(matches.length === 2) window.location.href = matches[1]
      }
    })
  }
  
  // Make initialization calls on document load
  if(document.addEventListener) {
    document.addEventListener("DOMContentLoaded", (event) => {
      commitchange.loadStylesheet()
      commitchange.appendMarkup()
    })
  } else if(windowAsAny.jQuery) {
    windowAsAny.jQuery(document).ready(() => {
      commitchange.loadStylesheet()
      commitchange.appendMarkup()
    })
  } else {
    window.onload = () => {
      commitchange.loadStylesheet()
      commitchange.appendMarkup()
    }
  }
  
  if(document.querySelector('.commitchange-donate')) {
    commitchange.loadStylesheet()
    commitchange.appendMarkup()
  }
  