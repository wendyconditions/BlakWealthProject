using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Models.Responses;
using Sabio.Services;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;


namespace Sabio.Web.Controllers.Api

{
    [RoutePrefix("api/comments")]
    public class CommentGroupController : ApiController
    {
        readonly ICommentGroupService commentGroupService;
        readonly IAuthenticationService authService;

        public CommentGroupController(ICommentGroupService commentGroupService, IAuthenticationService authService)
        {
            this.commentGroupService = commentGroupService;
            this.authService = authService;
        }

        [Route("contentitemid/{ContentItemId:int}"), HttpGet]
        public HttpResponseMessage GetAll(int ContentItemId)
        {
            try
            {
                var user = authService.GetCurrentUser();
                ItemsResponse<CommentGroupBase> Response = new ItemsResponse<CommentGroupBase>();
                Response.Items = commentGroupService.GetAll(ContentItemId);
                return Request.CreateResponse(HttpStatusCode.OK, Response);
            }
            catch (Exception exception)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, exception);
            }
        }

        [Route(), HttpPost]
        public HttpResponseMessage Insert(CommentGroupBase model)
        {
            var user = authService.GetCurrentUser();

            if (!ModelState.IsValid) //Model state is if the data that is required on the Model (domain)
                                     //is sent, if not valid then throw error
            {
                return Request.CreateErrorResponse(HttpStatusCode.Forbidden, ModelState);
            }
            else
            {
                ItemResponse<int> response = new ItemResponse<int>();
                model.UserId = user.Id;
                response.Item = commentGroupService.Insert(model);
                return Request.CreateResponse(HttpStatusCode.OK, model);
            }
        }

        [Route("{id:int}"), HttpPut]
        public HttpResponseMessage Update(CommentGroupBase model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
                }
                commentGroupService.Update(model);
                return Request.CreateResponse(HttpStatusCode.OK, model);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [Route("{id:int}"), HttpDelete]
        public HttpResponseMessage Delete(int Id)
        {
            commentGroupService.Delete(Id);
            return Request.CreateResponse(HttpStatusCode.OK, true);
        }

        [Route("{id:int}"), HttpGet]
        [AllowAnonymous]
        public HttpResponseMessage GetById(int Id)
        {
            ItemResponse<CommentGroupBase> response = new ItemResponse<CommentGroupBase>();
            response.Item = commentGroupService.GetById(Id);
            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
    }
}
