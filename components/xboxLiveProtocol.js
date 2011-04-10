/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Xbox LIVE.
 *
 * The Initial Developer of the Original Code is
 * Patrick Cloke <clokep@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const XBOX_LIVE_TAG_NAME = "Xbox LIVE";

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource:///modules/jsProtoHelper.jsm");
Cu.import("resource://xbox-live/utils.jsm");

Cu.import("resource:///modules/imServices.jsm");

var xblTag;

function Account(aProtoInstance, aKey, aName) {
  this._init(aProtoInstance, aKey, aName);
  this._gamercards = ["Major Nelson", "DarkJedi613"];

  xblTag = Services.tags.getTagByName(XBOX_LIVE_TAG_NAME) ||
           Services.tags.createTag(XBOX_LIVE_TAG_NAME);
}
Account.prototype = {
  __proto__: GenericAccountPrototype,

  connect: function() {
    this._loadGamercards();

    this.base.connected();
  },

  // When the user clicks "Disconnect" in account manager
  disconnect: function() {
    this.base.disconnecting(this._base.NO_ERROR, "Sending the QUIT message");
    this.base.disconnected();
  },

  // Attributes
  get canJoinChat() false,

  // Private Functions
  _loadGamercards: function() {
    dump("Hi");
    for each (let gamertag in this._gamercards) {
      dump("Accesssing: " + gamercardURL(gamertag));
      doXHRequest(gamercardURL(gamertag), null, null, this._addGamercards,
                  this._handleError, this);
    }
  },

  _addGamercards: function(aResponseText) {
    dump(aResponseText);
    let dom = HTMLParser(aResponseText);
    this.addBuddy(xblTag, "DarkJedi613");

    let buddy = Services.contacts.getBuddyByNameAndProtocol("DarkJedi613",
                                                            this.protocol);
  },

  _handleError: function(aStatusText) {
    Cu.reportError(aStatusText);
  }
};

function Protocol() {
  this.registerCommands();
}
Protocol.prototype = {
  __proto__: GenericProtocolPrototype,
  get name() "Xbox LIVE",
  get iconBaseURI() "chrome://prpl-xbox-live/skin/",
  get baseId() "prpl-xbox-live",

  usernameSplits: [ ],

  options: { },

  commands: [ ],

  get chatHasTopic() false,

  getAccount: function(aKey, aName) new Account(this, aKey, aName),
  classID: Components.ID("{2528dd21-0ab9-469b-ba6b-894c0fb7e8c0}")
};

const NSGetFactory = XPCOMUtils.generateNSGetFactory([Protocol]);
