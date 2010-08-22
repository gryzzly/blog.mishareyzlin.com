var articleCounter = 1;

ArticleProvider = function() {};

ArticleProvider.prototype.dummyData = [];

ArticleProvider.prototype.save = function(articles, callback) {
    var self = this,
        article = null;
    
    if(typeof(articles.length) == 'undefined') {
        articles = [articles];
    }
    
    for(var i = 0, l = articles.length; i < l; i++) {
        article = articles[i];
        article._id = articleCounter++;
        article.created_at = new Date();

        if(article.comments === undefined) {
            article.comments = [];
        }

        for(var j = 0, le = article.comments.length; j < le; j++) {
            article.comments[j].created_at = new Date();
        }

        self.dummyData[self.dummyData.length] = article;

    }
    callback(null, articles);
};

ArticleProvider.prototype.findAll = function(callback) {
    callback(null, this.dummyData);
};

ArticleProvider.prototype.findById = function(id, callback) {
    var result = null;
    for(var i = 0, l = this.dummyData.length; i < l; i++) {
        if (this.dummyData[i]._id == id) {
            result = this.dummyData[i];
            break;
        }
    }
    callback(null, result);
};


/* Lets bootstrap with dummy data */
new ArticleProvider().save([
    {title: 'Post one', body: 'Body one', comments:[{author: 'Bob', comment: 'I love it'}, {author: 'Dave', comment: 'This is rubbish!'}]},
    {title: 'Post two', body: 'Body two'},
    {title: 'Post three', body: 'Body three'}
], function(error, articles){});

exports.ArticleProvider = ArticleProvider;
