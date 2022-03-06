
/*!
 * youtube
 * Copyright(c) 2011 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var mime = require('mime')
  , EventEmitter = require('events').EventEmitter
  , parseUrl = require('url').parse
  , request = require('request')
  , http = require('http')
  , xml2js = require('xml2js')
  , qs = require('qs')
  , fs = require('fs');

/**
 * Library version.
 */

exports.version = '0.1.0';

/**
 * Expose `Upload`.
 */

exports.Upload = Upload;

/**
 * Return embed HTML for the given youtube video `id`,
 * and `width` / `height` defaulting to 640x390.
 *
 * @param {String} id
 * @param {Number} width
 * @param {Number} height
 * @return {String}
 * @api public
 */

exports.embed = function(id, width, height){
  width = width || 640;
  height = height || 390;
  return '<object width="' + width + '" height="' + height
    + '"><param name="movie" value="http://www.youtube.com/v/' + id
    + '&hl=en_US&feature=player_embedded&version=3">'
    + '</param><param name="allowFullScreen" value="true">'
    + '</param><param name="allowScriptAccess" value="always">'
    + '</param><embed src="http://www.youtube.com/v/' + id
    + '&hl=en_US&feature=player_embedded&version=3" type="application/x-shockwave-flash"'
    + 'allowfullscreen="true" allowScriptAccess="always" width="' + width
    + '" height="' + height + '"></embed></object>';
};

/**
 * Shortcut for `new Upload(path)`.
 *
 * @param {String} path
 * @return {Upload}
 * @api public
 */

exports.createUpload = function(path){
  return new Upload(path);
};

/**
 * Initialize a new `Upload` with the given video `path` or id.
 *
 * @param {String} path or id
 * @api public
 */

function Upload(path) {
  this.meta = {};
  this.id = path;
  this.path = path;
  this.keywords([]);
  this.rate(true);
  this.comments(true);
  this.commentVoting(true);
  this.list(true);
  this.embed(true);
  this.syndicate(true);
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Upload.prototype.__proto__ = EventEmitter.prototype;

/**
 * Set the `user`.
 *
 * @param {String} user
 * @return {Upload}
 * @api public
 */

Upload.prototype.user = function(user){
  this._user = user;
  return this;
};

/**
 * Set the `password`.
 *
 * @param {String} password
 * @return {Upload}
 * @api public
 */

Upload.prototype.password = function(password){
  this._password = password;
  return this;
};

/**
 * Set the `source`.
 *
 * @param {String} source
 * @return {Upload}
 * @api public
 */

Upload.prototype.source = function(source){
  this._source = source;
  return this;
};

/**
 * Set the video `title`.
 *
 * @param {String} title
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.title = function(title){
  this.meta.title = title;
  return this;
};

/**
 * Set developer `key`.
 *
 * @param {String} key
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.key = function(key){
  this._key = key;
  return this;
};

/**
 * Set the video `description`.
 *
 * @param {String} description
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.description = function(description){
  this.meta.description = description;
  return this;
};

/**
 * Set `category`.
 *
 * @param {String} category
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.category = function(category){
  this.meta.category = category;
  return this;
};

/**
 * Set keywords to `arr`.
 *
 * @param {Array} arr
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.keywords = function(arr){
  this.meta.keywords = arr;
  return this;
};

/**
 * Allow or deny video rating.
 *
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.rate = function(allow){
  this.meta.rate = allow;
  return this;
};

/**
 * Allow or disallow comments.
 *
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.comments = function(allow){
  this.meta.comment = allow;
  return this;
};

/**
 * Allow or disallow comment voting.
 *
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.commentVoting = function(allow){
  this.meta.commentVote = allow;
  return this;
};

/**
 * Allow or disallow embedding.
 *
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.embed = function(allow){
  this.meta.embed = allow;
  return this;
};

/**
 * Allow or disallow syndication.
 *
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.syndicate = function(allow){
  this.meta.syndicate = allow;
  return this;
};

/**
 * List or unlist the video.
 *
 * @return {Upload} for chaining
 * @api public
 */

Upload.prototype.list = function(allow){
  this.meta.list = allow;
  return this;
};

/**
 * Get auth token, and invoke `fn(err, res)`.
 *
 * @param {Function} fn
 * @return {Upload} for chaining
 * @api private
 */

Upload.prototype.getAuth = function(fn){
  var options = {};

  options.url = 'https://www.google.com/accounts/ClientLogin';
  options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  options.body = qs.stringify({
      Email: this._user
    , Passwd: this._password
    , source: this._source
    , service: 'youtube'
  });

  request.post(options, function(err, res, body){
    if (err) return fn(err);
    fn(null, parse(body));
  });

  return this;
};

/**
 * Upload the video and invoke `fn(err)`.
 *
 * @param {Function} fn
 * @return {Upload} for chaining
 * @api private
 */

Upload.prototype.uploadData = function(fn){
  var self = this
    , options = {}
    , auth = this.auth
    , path = this.path
    , boundary = 'keyboardcat'
    , tail = '\r\n--' + boundary + '--\r\n'
    , len = tail.length
    , key = this._key
    , user = this._user
    , body = '';

  function buf(str) {
    body += str;
    len += Buffer.byteLength(str);
  }

  var url = 'http://uploads.gdata.youtube.com/feeds/api/users/' + user + '/uploads';

  url = parseUrl(url);
  options.method = 'POST';
  options.path = url.pathname;
  options.host = url.hostname;

  fs.stat(path, function(err, stat){
    if (err) return fn(err);
    // xml
    buf('\r\n--' + boundary + '\r\n');
    buf('Content-Type: application/atom+xml; charset=UTF-8\r\n');
    buf('\r\n');
    buf(self.metadata());

    // video
    len += stat.size;
    buf('\r\n--' + boundary + '\r\n');
    buf('Content-Type: video/webm\r\n');
    buf('Content-Transfer-Encoding: binary\r\n');
    buf('\r\n');

    // header
    options.headers = {
        'Authorization': 'GoogleLogin auth=' + auth
      , 'GData-Version': '2'
      , 'X-GData-Key': 'key=' + key
      , 'Accept': 'text/plain'
      , 'Content-Type': 'multipart/related; boundary=' + boundary
      , 'Content-Length': len
      , 'Slug': path
    };

    // make the request
    var req = http.request(options, function(res){
      // failed
      if (res.statusCode >= 400) {
        var buf = '';
        res.on('data', function(chunk){ buf += chunk; });
        res.on('end', function(){
          fn(new Error(buf || 'Status ' + res.statusCode + ' without body'));
        });
      // ok
      } else {
        self.parseXML(res, fn);
      }
    });

    // stream the file part
    var stream = fs.createReadStream(path, { end: false });
    self.emit('stream', stream, stat.size);
    req.write(body);
    stream.on('end', function(){
      req.write(tail);
    }).pipe(req);
  });

  return this;
};

/**
 * Parse the XML `res`.
 *
 * @param {IncomingMessage} res
 * @param {Function} fn
 * @api private
 */

Upload.prototype.parseXML = function(res, fn){
  var parser = new xml2js.Parser;
  res.setEncoding('utf8');
  res.on('data', function(chunk){ parser.parseString(chunk); });
  parser.on('end', function(obj){
    obj.url = obj['media:group']['media:content']['@'].url;
    obj.id = obj['media:group']['yt:videoid'];
    obj.embed = function(width, height){
      return exports.embed(obj.id, width, height);
    };
    fn(null, obj);
  });
};

/**
 * Upload and invoke `fn(err, info)`.
 *
 * @param {Function}
 * @api public
 */

Upload.prototype.upload = function(fn){
  var self = this;
  this.getAuth(function(err, res){
    if (err) return fn(err);
    self.auth = res.auth;
    self.uploadData(fn);
  });
  return this;
};

/**
 * Delete the video and invoke `fn(err)`.
 *
 * @param {Type} name
 * @return {Type}
 * @api public
 */

Upload.prototype.destroy = function(fn){
  var self = this;
  this.getAuth(function(err, res){
    if (err) return fn(err);
    var options = {}
      , auth = res.auth
      , id = self.path
      , key = self._key
      , user = self._user
      , body = '';

    var url = 'http://gdata.youtube.com/feeds/api/users/default/uploads/' + id;

    url = parseUrl(url);
    options.method = 'DELETE';
    options.path = url.pathname;
    options.host = url.hostname;

    options.headers = {
        'Authorization': 'GoogleLogin auth=' + auth
      , 'GData-Version': '2'
      , 'X-GData-Key': 'key=' + key
      , 'Accept': 'text/plain'
    };

    // make the request
    var req = http.request(options, function(res){
      // failed
      if (res.statusCode >= 400) {
        var buf = '';
        res.on('data', function(chunk){ buf += chunk; });
        res.on('end', function(){
          fn(new Error(buf || 'Status ' + res.statusCode + ' without body'));
        });
      // ok
      } else {
        fn();
      }
    });

    req.end();
  });
};

/**
 * Generate XML meta-data.
 *
 * @return {String}
 * @api public
 */

Upload.prototype.metadata = function(){
  var meta = this.meta;
  return '<?xml version="1.0"?>\
  <entry xmlns="http://www.w3.org/2005/Atom"\
    xmlns:media="http://search.yahoo.com/mrss/"\
    xmlns:yt="http://gdata.youtube.com/schemas/2007">\
    <media:group>\
      <media:title type="plain">' + escape(meta.title) + '</media:title>\
      <media:description type="plain">' + escape(meta.description) + '</media:description>\
      <media:category\
        scheme="http://gdata.youtube.com/schemas/2007/categories.cat">' + meta.category + '\
      </media:category>\
      <media:category\
        scheme="http://gdata.youtube.com/schemas/2007/developertags.cat">LearnBoost\
      </media:category>\
      <media:keywords>' + meta.keywords.join(', ') + '</media:keywords>\
    </media:group>\
    <yt:accessControl action="list" permission="' + (meta.list ? 'allowed' : 'denied') + '"/>\
    <yt:accessControl action="rate" permission="' + (meta.rate ? 'allowed' : 'denied') + '"/>\
    <yt:accessControl action="comment" permission="' + (meta.comment ? 'allowed' : 'denied') + '"/>\
    <yt:accessControl action="commentVote" permission="' + (meta.commentVote ? 'allowed' : 'denied') + '"/>\
    <yt:accessControl action="embed" permission="' + (meta.embed ? 'allowed' : 'denied') + '"/>\
    <yt:accessControl action="syndicate" permission="' + (meta.syndicate ? 'allowed' : 'denied') + '"/>\
  </entry>';
};

/**
 * Parse googles weird x-www-form-urlencoded-ish response.
 *
 * @param {String} body
 * @return {Object}
 * @api private
 */

function parse(body) {
  return body.split('\n').reduce(function(obj, str){
    var parts = str.split('=')
      , key = parts.shift()
      , val = parts.shift();
    obj[key.toLowerCase()] = val;
    return obj;
  }, {});
}

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 * @api private
 */

function escape(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};
