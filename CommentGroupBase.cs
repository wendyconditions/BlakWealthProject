using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sabio.Models.Domain
{
    public class CommentGroupBase 
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "Comment is required")] 
        public string Comment { get; set; }
        public int ContentItemId { get; set; }
        public int ParentCommentId { get; set; }
        public int UserId { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateDeactivated { get; set; }
        public string UserName { get; set; }
        public string UserProfilePicture { get; set; }
    }
}
