# frozen_string_literal: true

# License: AGPL-3.0-or-later WITH WTO-AP-3.0-or-later
# Full license explanation at https://github.com/houdiniproject/houdini/blob/master/LICENSE
class ObjectEventHookConfig < ApplicationRecord

  # :webhook_service, #str, webhook service to be called
  # :configuration, #jsonb, configuration needed to connect to the webhook
  # :object_event_types, #text (array), a set of object event types

  belongs_to :nonprofit

  validates :webhook_service, presence: true
  validates :configuration, presence: true
  validates :object_event_types, presence: true

  serialize :object_event_types, Array

  WEBHOOK = {
    open_fn: 'open_fn'
  }.freeze

  def webhook
    case webhook_service
    when WEBHOOK[:open_fn]
      Houdini::WebhookAdapter::OpenFn.new(configuration)
    end
  end
end