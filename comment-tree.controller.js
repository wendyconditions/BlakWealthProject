﻿(function () {
    "use strict";

    angular.module("BlakWealth")
        .controller("commentTree", commentTree);

    commentTree.$inject = ['commentService', 'userService', '$scope', 'alertService'];

    function commentTree(commentService, userService, $scope, alertService) {
        var c = this;
        c.$onInit = _init;
        c.btnSubmit = btnSubmit;
        c.data = null;
        c.signedIn = false;
        c.showCommentsButton = showCommentsButton;
        c.showComments = true;
        c.commentById = null;
        c.contentId = null;

        //////////////

        function _init() {
            userService.getInfo().then(_getInfoSuccess);

            if (!c.comments) {
                _getComments(c.contentId);
            } else {
                c.showComments = false;
            }
        }
        
        function showCommentsButton() {
            if (c.showComments === false) {
                c.showComments = true;
            } else {
                c.showComments = false;
            }
        }

        $scope.$on('replyComments', function test(event, data) {
            _getComments(data);
        })

        function _getComments(data) {
            if (!data) {
                commentService.comments(c.contentItemId).then(_commentsLoadSuccess, _genericError);
            } else {
                commentService.comments(data).then(_commentsLoadSuccess, _genericError);
            }
        }

        function _getInfoSuccess(response) {
            if (!response) {
                c.signedIn = false;
            } else {
                c.signedIn = response;
            }
        }

        function _commentsLoadSuccess(data) {
            c.comments = data;
        }

        function _genericError(error) {
            alertService.error("Error loading comments, please try again later.", "ERROR");
        }

        function btnSubmit() {
            c.data.contentItemId = c.contentItemId;
            commentService.create(c.data).then(_createSuccess, _genericError);
        }

        function _createSuccess() {
            commentService.comments(c.contentItemId).then(_commentsLoadSuccess, _genericError);
            c.data = null;
        }
    }

})();

(function () {
    "use strict";

    angular.module("BlakWealth")
        .controller("replyTree", replyTree);

    replyTree.$inject = ['commentService', '$scope', 'alertService', '$uibModal'];

    function replyTree(commentService, $scope, alertService, $uibModal) {
        var vm = this;
        vm.data = null;
        vm.btnRplySubmit = btnRplySubmit;
        vm.comments = [];
        vm.viewReplies = false;
        vm.btnViewrply = btnViewrply;
        vm.editMode = editMode;
        vm.activeForm = null;
        vm.btnDelete = _deleteCommentModal;
        vm.activeReplyBox = false;
        vm.index = null;

        ////////////

        function _deleteSuccess(data) {
            $scope.$emit('replyComments', null);
        }

        function editMode(reply) {
            vm.activeForm = true;
            vm.data = {
                comment: reply.comment
                , contentItemId: reply.contentItemId
                , userId: reply.userId
                , parentCommentId: reply.parentCommentId
                , id: reply.id
            };
            return vm.data;
        }

        function btnViewrply() {
            if (vm.viewReplies === false) {
                vm.viewReplies = true;
            } else {
                vm.viewReplies = false;
            }
        }

        function btnRplySubmit(data, reply, children) {
            if (data.id > 0) {
                commentService.update(vm.data).then(function () {
                    $scope.$emit('replyComments', data.contentItemId);
                    alertService.success("Successfully updated your comment");
                }, _genericError);
            } else {
                data.contentItemId = reply.contentItemId;
                data.parentCommentId = reply.id;
                commentService.create(data).then(function (response) {
                    data.children = [];
                    children.push(data);
                    $scope.$emit('replyComments', data.contentItemId);
                }, _genericError);
            }
        }

        function _genericError(error) {
            alertService.error("An error occured while updating your comment. Please try again", "ERROR");
        }

        function _commentsLoadSuccess(data) {
            vm.comments = data;
        }

        function _deleteCommentModal(id, index) {
            $uibModal.open({
                templateUrl: 'deleteCommentModal.html',
                controller: modalController
            });
            modalController.$inject = ['$scope', '$uibModalInstance'];
            function modalController($scope, $uibModalInstance) {
                $scope.btnRemove = function () {
                    commentService.delete(id).then(_deleteSuccess, null);
                    $uibModalInstance.close();
                };
                $scope.btnCancel = function () {
                    $uibModalInstance.close();
                };
            }
        }
    }
})();
