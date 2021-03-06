﻿import _ from 'common/shim/lodash.reference.shim';
import {Model} from 'backbone';
import Video from 'background/model/video';
import ListItemType from 'common/enum/listItemType';

var PlaylistItem = Model.extend({
  defaults: {
    id: null,
    playlistId: null,
    sequence: -1,
    selected: false,
    firstSelected: false,
    video: null,
    listItemType: ListItemType.PlaylistItem
  },

  parse: function(playlistItemDto) {
    // Patch requests do not return information.
    if (!_.isUndefined(playlistItemDto)) {
      // Convert C# Guid.Empty into BackboneJS null
      for (var key in playlistItemDto) {
        if (playlistItemDto.hasOwnProperty(key) && playlistItemDto[key] === '00000000-0000-0000-0000-000000000000') {
          playlistItemDto[key] = null;
        }
      }

      // Take json of video and set into model. Delete to prevent overriding on return of data object.
      this.get('video').set(playlistItemDto.video);
      delete playlistItemDto.video;
    }

    return playlistItemDto;
  },

  toJSON: function() {
    // toJSON doesn't provide cid, but it is needed for re-mapping collections after bulk creates.
    var json = Model.prototype.toJSON.apply(this, arguments);
    json.cid = this.cid;
    return json;
  },

  initialize: function() {
    this._ensureVideoModel();
  },

  _ensureVideoModel: function() {
    var video = this.get('video');

    // Need to convert video object to Backbone.Model
    if (!(video instanceof Model)) {
      // Silent because video is just being properly set.
      this.set('video', new Video(video), {silent: true});
    }
  }
});

export default PlaylistItem;