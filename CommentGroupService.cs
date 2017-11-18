using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Models.Responses;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sabio.Services
{

    public class CommentGroupService : ICommentGroupService
    {
        //delcaring/instaniating dataprovider
        private IDataProvider _dataProvider;
        readonly INotificationService notificationService;

        public CommentGroupService(IDataProvider dataProvider, INotificationService notificationService)
        {
            _dataProvider = dataProvider;
            this.notificationService = notificationService;
        }

        public List<CommentGroupBase> GetAll(int ContentItemId)
        {
            List<CommentGroupBase> list = null;

            _dataProvider.ExecuteCmd("dbo.CommentGroup_GetUserName"
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@ContentItemId", ContentItemId);
                },
                singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    CommentGroupBase singleItem = new CommentGroupBase();
                    int startingIndex = 0; //startingOrdinal

                    singleItem.Id = reader.GetSafeInt32(startingIndex++);
                    singleItem.Comment = reader.GetSafeString(startingIndex++);
                    singleItem.ContentItemId = reader.GetSafeInt32(startingIndex++);
                    singleItem.ParentCommentId = reader.GetSafeInt32(startingIndex++);
                    singleItem.UserId = reader.GetSafeInt32(startingIndex++);
                    singleItem.DateCreated = reader.GetDateTime(startingIndex++);
                    singleItem.DateDeactivated = reader.GetSafeDateTimeNullable(startingIndex++);
                    singleItem.UserName = reader.GetSafeString(startingIndex++);
                    singleItem.UserProfilePicture = reader.GetSafeString(startingIndex++);


                    //not going to create list if there's no data / lazy load / if statement
                    if (list == null)
                    {
                        list = new List<CommentGroupBase>();
                    }

                    list.Add(singleItem);
                });
             return list;
        }

        public int Insert(CommentGroupBase model)
        {
            int Id = 0;

            _dataProvider.ExecuteNonQuery("dbo.CommentGroup_Insert"
               , inputParamMapper: delegate (SqlParameterCollection paramCollection)
               {
                   paramCollection.AddWithValue("@Comment", model.Comment);
                   paramCollection.AddWithValue("@ContentItemId", model.ContentItemId);
                   paramCollection.AddWithValue("@ParentCommentId", model.ParentCommentId);
                   paramCollection.AddWithValue("@UserId", model.UserId);

                   SqlParameter idParameter = new SqlParameter("@Id", System.Data.SqlDbType.Int);
                   idParameter.Direction = System.Data.ParameterDirection.Output;

                   paramCollection.Add(idParameter);

               }, returnParameters: delegate (SqlParameterCollection param)
               {
                   Int32.TryParse(param["@Id"].Value.ToString(), out Id);
               }
               );

            notificationService.ProcessNotificationsForComment(new Notification_CreateNotificationRequest
            {
                CommentId = Id,
                CommentText = model.Comment,
                SourceUserId = model.UserId,
                Type = "comment"
            });

            return Id;
        }

        public void Update(CommentGroupBase model)
        {

            _dataProvider.ExecuteNonQuery("dbo.CommentGroup_Update"
               , inputParamMapper: delegate (SqlParameterCollection paramCollection)
               {
                   paramCollection.AddWithValue("@Comment", model.Comment);
                   paramCollection.AddWithValue("@ContentItemId", model.ContentItemId);
                   paramCollection.AddWithValue("@ParentCommentId", model.ParentCommentId);
                   paramCollection.AddWithValue("@UserId", model.UserId);
                   paramCollection.AddWithValue("@Id", model.Id);

               });
        }

        public void Delete(int Id)
        {
            _dataProvider.ExecuteNonQuery("dbo.CommentGroup_Delete"
              , inputParamMapper: delegate (SqlParameterCollection paramCollection)
              {
                  paramCollection.AddWithValue("@Id", Id);
              });
        }

        public CommentGroupBase GetById(int id)
        {
            CommentGroupBase singleItem = null;

            _dataProvider.ExecuteCmd("dbo.CommentGroup_GetById"
               , inputParamMapper: delegate (SqlParameterCollection paramCollection)
               {
                   paramCollection.AddWithValue("@Id", id);
               }
               , singleRecordMapper: delegate (IDataReader reader, short set)
               {
                   singleItem = new CommentGroupBase();
                   int startingIndex = 0; //startingOrdinal

                   singleItem.Id = reader.GetSafeInt32(startingIndex++);
                   singleItem.Comment = reader.GetSafeString(startingIndex++);
                   singleItem.ContentItemId = reader.GetSafeInt32(startingIndex++);
                   singleItem.ParentCommentId = reader.GetSafeInt32(startingIndex++);
                   singleItem.UserId = reader.GetSafeInt32(startingIndex++);

               }
               );
            return singleItem;
        }
    }
}
