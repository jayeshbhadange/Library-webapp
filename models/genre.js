const mongoose=require('mongoose')
const schema=mongoose.Schema;
const genreschema=new schema({
    name:{type:String, required:true, minLength:3, maxLength:100},

})
genreschema.virtual('url').get(function(){
    return `/catalog/genre/${this._id}`;
});
module.exports=mongoose.model('Genre',genreschema);