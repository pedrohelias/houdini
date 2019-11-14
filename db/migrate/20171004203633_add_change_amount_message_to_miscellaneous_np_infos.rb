# frozen_string_literal: true

# License: AGPL-3.0-or-later WITH Web-Template-Output-Additional-Permission-3.0-or-later
class AddChangeAmountMessageToMiscellaneousNpInfos < ActiveRecord::Migration[4.2]
  def change
    add_column :miscellaneous_np_infos, :change_amount_message, :text
  end
end
