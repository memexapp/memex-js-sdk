// @flow

import type { MediaType, MediaDataState, EntityState } from './Types.js';
import { mediaDataStates, mediaTypes, entityStates } from './Types.js';

import base64 from 'base-64';
import utf8 from 'utf8';

/** Class represents media component of space */
export default class Media {

  /** Unique media identifier */
  MUID: ?string;
  /** Creation timestamp */
  createdAt: ?Date;
  /** Timestamp of last update */
  updatedAt: ?Date;
  /** Visibility state */
  state: EntityState;
  /** JSON encodec dictionary of media metadata eg. size, encoding, etc. */
  metadata: ?string;
  /** Semantic type of media (reference, source, thumbnail, summary, etc.) */
  mediaType: MediaType;
  /** Owner user ID */
  ownerID: ?number;
  /** If media represents any space then its MUID is present */
	representedSpaceMUID: ?string;
  /** Validity of media data */
  dataState: MediaDataState;
  /** Embed media binary data (only if small enough, otherwise use dataDownloadURL and dataUploadURL) */
  embedData: ?ArrayBuffer;
  /** Download url for data (exclusive with embedData) */
  dataDownloadURL: ?string;
  /** Upload link for new data. After data is uploaded it is needed to call mark media as uploaded function. */
  dataUploadURL: ?string;

  constructor() {
    this.state = entityStates.unknown;
    this.dataState = mediaDataStates.unknown;
    this.mediaType = mediaTypes.source;
  }

  /**
   * Sets embedData (binary format) from base64 format
   *
   * @param string base64: Base64 encoded data
   */
  setEmbedDataFromBase64(base64: string) {
    let binaryString = window.atob(base64);
    let length = binaryString.length;
    let bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    this.embedData = bytes.buffer;
  }

  /**
   * Sets embedData (binary format) from ANSCI ancoded text
   *
   * @param string value: ANSCII encoded data
   */
  setEmbedDataFromString(value: string) {
    let length = value.length;
    let array = new Uint8Array(length);
    for (let index = 0; index < length; index++) {
      array[index] = value.charCodeAt(index);
    }
    this.embedData = array.buffer;
  }


  /**
   * Converts emebedData into base64 encoded string
   *
   * @returns string Base64 encoded embedData
   */
  base64EmbedData(): ?string {
    if (this.embedData == null) {
      return null;
    }
    let binary = '';
    let bytes = new Uint8Array(this.embedData);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Converts utf8 encoded emebedData into string
   *
   * @returns string Decoded text
   */
  textualEmbedData(): ?string {
    if (this.embedData == null) {
      return null;
    }
    let encoded = this.base64EmbedData();
    let bytes = base64.decode(encoded);
    let text = utf8.decode(bytes);
    return text;
  }

  fromJSON(json: Object) {
    this.MUID = json.muid;
    this.state = json.state;
    this.mediaType = json.type;
    this.dataState = json.data_state;
    if (json.embeded_data != null) {
      this.setEmbedDataFromBase64(json.embeded_data);
    } else {
      this.embedData = null;
    }
    this.dataDownloadURL = json.data_download_url;
    this.dataUploadURL = json.data_upload_url;
  }

  toJSON(): Object {
    return {
      type: this.mediaType,
      data_download_url: this.dataDownloadURL,
      embeded_data: this.base64EmbedData(),
      data_state: this.dataState
    };
  }
}
