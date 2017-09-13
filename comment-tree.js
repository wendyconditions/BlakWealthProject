(function () {
    "use strict";

    angular
        .module('BlakWealth')
        .component("commentTree", {
            templateUrl: "comment-tree/comment-tree.html",
            controller: "commentTree",
            bindings: {
                contentItemId: '<',
                comments: '<',
                parentCommentId: '<'
            }
        });
})();

(function () {
    "use strict";

    angular
        .module('BlakWealth')
        .filter('reverse', function () {
            return function (items) {
                if (items) {
                    return items.slice().reverse();
                }
            };
        });
})();

(function () {
    "use strict";

    angular
        .module('BlakWealth')
        .factory('commentFactory', commentFactory);

    commentFactory.$inject = ['$http', '$q'];

    function commentFactory($http, $q) {
        var service = {
            loadComments: _getComments
            , createComment: _postComment
            , deleteComment: _deleteComment
            , updateComment: _updateComment
        };

        return service;

        ////////////

        function _getComments(contentItemId) {
            var settings = {
                method: "GET"
                , url: "/api/comments/contentItemId/" + contentItemId
            };
            return $http(settings)
                .then(_getCommentSuccess, _getCommentError);
        }

        function _getCommentSuccess(response) {
            var allComments = response.data.items;
            var allCommentIndex = {};
            var topLevelComments = [];

            if (!allComments) {
                topLevelComments = null;
            } else {
                for (var i = 0; i < allComments.length; i++) {
                    var comment = allComments[i];
                    comment.children = [];

                    if (comment.dateDeactivated != null) {
                        comment.comment = "Comment Deleted";
                        comment.userName = "Anonymous";
                        comment.userProfilePicture = "#defaulImg";
                    }

                    allCommentIndex[comment.id] = comment;
                }

                for (var key in allCommentIndex) {
                    var comments = allCommentIndex[key];
                    if (!comments.parentCommentId) {
                        topLevelComments.push(comments);
                    } else {
                        var parentComment = allCommentIndex[comments.parentCommentId];
                        parentComment.children.push(comments);
                    }
                }
            }
            return topLevelComments;
        }

        function _getCommentError(error) {
            return $q.reject(error.data.message);
        }

        function _postComment(commentData) {
            var settings = {
                method: "POST"
                , url: "/api/comments/"
                , data: commentData
            };
            return $http(settings)
                .then(null, _postCommentError);
        }

        function _postCommentError(error) {
            return $q.reject(error);
        }

        function _deleteComment(commentId) {
            var settings = {
                method: "DELETE"
                , url: "/api/comments/" + commentId
            };
            return $http(settings)
                .then(null, _deleteError);
        }

        function _deleteError(error) {
            return $q.reject(error.data.message);
        }

        function _updateComment(commentData) {
            var settings = {
                method: "PUT"
                , url: "/api/comments/" + commentData.id
                , data: commentData
            };
            return $http(settings)
                .then(null, _updateError);
        }

        function _updateError(error) {
            return $q.reject(error.data.message);
        }
    }
})();
