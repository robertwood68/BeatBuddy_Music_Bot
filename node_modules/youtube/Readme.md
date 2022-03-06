
# youtube

  YouTube upload API

## Example

```js
var youtube = require('../');

var video = youtube
.createUpload('/path/to/my/video.webm')
.user('tjholowaychukable')
.source('LearnBoost')
.password('rightmeow')
.key('AI39si6L-CpOoC82Kn1noxwSXbfySDW0VCpxIPPwIu2YgZthc_XKEZPLw-4mxRxZYyh-xrGhZmuIKkNfFkhvZrptwc62qbXW8Q')
.title('Testing')
.description('Some test stuff')
.category('Education')
.upload(function(err, res){
  if (err) throw err;
  console.log('done');
  console.log(res.id);
  console.log(res.url);
  console.log(res.embed());
  console.log(res.embed(320, 320));
  console.log(require('util').inspect(res, false, 15, true));
});
```

embed via id:

```js
youtube.embed(video.id);
// => String
```

## License 

(The MIT License)

Copyright (c) 2011 LearnBoost &lt;tj@learnboost.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.