﻿import _ from 'common/shim/lodash.reference.shim';
import {Model} from 'backbone';
import ChromeCommand from 'background/enum/chromeCommand';

var PlayPauseButton = Model.extend({
  defaults: {
    enabled: false,
    player: null,
    streamItems: null,
  },

  initialize: function() {
    var streamItems = this.get('streamItems');
    this.listenTo(streamItems, 'add:completed', this._onStreamItemsAddCompleted);
    this.listenTo(streamItems, 'remove', this._onStreamItemsRemove);
    this.listenTo(streamItems, 'reset', this._onStreamItemsReset);
    chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));

    this._toggleEnabled(streamItems.isEmpty());
  },

  // Only allow changing once every 100ms to preent spamming.
  tryTogglePlayerState: _.debounce(function() {
    if (this.get('enabled')) {
      this.get('player').toggleState();
    }

    return this.get('enabled');
  }, 100, true),

  _onChromeCommandsCommand: function(command) {
    if (command === ChromeCommand.ToggleVideo) {
      var didTogglePlayerState = this.tryTogglePlayerState();

      if (!didTogglePlayerState) {
        StreamusBG.channels.notification.commands.trigger('show:notification', {
          title: chrome.i18n.getMessage('keyboardCommandFailure'),
          message: chrome.i18n.getMessage('cantToggleVideo')
        });
      }
    }
  },

  _onStreamItemsAddCompleted: function(collection) {
    this._toggleEnabled(collection.isEmpty());
  },

  _onStreamItemsRemove: function(model, collection) {
    this._toggleEnabled(collection.isEmpty());
  },

  _onStreamItemsReset: function(collection) {
    this._toggleEnabled(collection.isEmpty());
  },

  _toggleEnabled: function(streamItemsEmpty) {
    this.set('enabled', !streamItemsEmpty);
  }
});

export default PlayPauseButton;