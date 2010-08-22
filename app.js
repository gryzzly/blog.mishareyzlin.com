/* -== DEFINING ==- */
var express = require('express'),
    app = express.createServer(),
    ArticleProvider = require('./articleprovider-memory').ArticleProvider,
    pub = __dirname + '/public';
    
/* -== CONFIG ==- */
app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyDecoder());
    app.use(app.router);
    app.use(express.staticProvider(pub));
    /* enable SASS */
    app.use(express.compiler({ src: pub, enable: ['sass'] }));
    /* templating engine */
    app.set('view engine', 'jade');
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

/* -== APP ==- */
var articleProvider = new ArticleProvider();

app.get('/', function(req, res) {
    articleProvider.findAll(function(error, articles) {
        res.render('blogs_index', {
            locals : {
                title : 'Blog',
                articles: articles
            }
        });
    });
});

app.get('/blog/new', function(req, res) {
  res.render('blog_new', {
    locals: {
      title: 'New Post'
    }
  });
});

app.post('/blog/new', function(req, res) {
  articleProvider.save({
    title: req.param('title'),
    body: req.param('body')
  }, function(error, articles) {
    res.redirect('/');
  });
});

/* -== RUNNING SERVER ==- */
app.listen(3000);
console.log('Express server started on port %s', app.address().port);
