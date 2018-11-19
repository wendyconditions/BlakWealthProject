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
        .factory('commentService', commentService);

    commentService.$inject = ['$http', '$q'];

    function commentService($http, $q) {
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
                .then(_getCommentSuccess, _commentServiceError);
        }

        function _getCommentSuccess(response) {
            var allComments = response.data.items;
            var allCommentIndex = {};
            var topLevelComments = [];

            // If no comments for content, set to null, return
            if (!allComments) {
                topLevelComments = null;
            } else {
                // Add empty children array to each object
                // Find deleted comments and set default values
                // Set new modified objects to a new object allCommentIndex
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

                // Check if first level comments have any children(replies)
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

        function _postComment(commentData) {
            var settings = {
                method: "POST"
                , url: "/api/comments/"
                , data: commentData
            };
            return $http(settings);
        }

        function _deleteComment(commentId) {
            var settings = {
                method: "DELETE"
                , url: "/api/comments/" + commentId
            };
            return $http(settings);
        }
        
        function _updateComment(commentData) {
            var settings = {
                method: "PUT"
                , url: "/api/comments/" + commentData.id
                , data: commentData
            };
            return $http(settings);
        }
        
        function _commentServiceError(error) {
            return $q.reject(error);
        }
    }
})();
