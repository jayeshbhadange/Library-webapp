const Genre = require("../models/genre");
const Book = require("../models/book");
const {body, validationResult} = require("express-validator");
const asyncHandler = require("express-async-handler");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allgenre=await Genre.find().sort({name:1}).exec();
  res.render("genre_list", {title: "Genre List", genre_list: allgenre});
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, genreBooks] = await Promise.all([Genre.findById(req.params.id).exec(), Book.find({genre:req.params.id})]);
  if(genre==null){
    const err=new Error("genre not found");
    err.status=404;
    next(err);
  }
  res.render("genre_detail", {title:"Genre Detail", genre:genre, genre_books: genreBooks})
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  res.render("genre_form",{title:"Create Genre"});
});

// Handle Genre create on POST.
exports.genre_create_post =[body("name","genre must contain atleast 3 characcters").trim().isLength({min:3}).escape(),
  asyncHandler(async(req,res,next)=>{
    const result=validationResult(req);
    const genre=new Genre({name:req.body.name});
    if(!result.isEmpty()){
      res.render("genre_form",{title:"Create Genre", genre:genre, errors: result.array()})
      return;
    }
    else{
      const genreexist= await Genre.findOne({name:req.body.name}).collation({locale:"en",strength:2}).exec();
      if(genreexist){
        res.redirect(genreexist.url)
      }
      else{
        await genre.save();
        res.redirect(genre.url)
      }
    }


  })
]

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre,genrebooks]=await Promise.all([Genre.findById(req.params.id).exec(),Book.find({genre:req.params.id}).exec()])
  if(genre==null){
    res.redirect("/catalog/genres");
  }
  res.render("genre_delete",{title:"Delete Genre", genre:genre, genre_books:genrebooks})

});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre,genrebooks]=await Promise.all([Genre.findById(req.body.id).exec(),Book.find({genre:req.body.id}).exec()])
  if(genrebooks.length>0){
    res.render("genre_delete",{title:"Delete Genre", genre:genre, genre_books:genrebooks})
    return;
  }
  else{
    await Genre.findByIdAndDelete(req.body.id).exec();
    res.redirect("/catalog/genres");
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre= await Genre.findById(req.params.id).exec();
  if(genre===null){
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }
  res.render("genre_form", { title: "Update Genre", genre: genre });
});

// Handle Genre update on POST.
exports.genre_update_post = [body("name", "genre must have atleast 3 characters").trim().isLength({min:3}).escape(),
asyncHandler(async (req, res, next) => {
  // Extract the validation errors from a request .
  const errors = validationResult(req);

  // Create a genre object with escaped and trimmed data (and the old id!)
  const genre = new Genre({
    name: req.body.name,
    _id: req.params.id,
  });

  if (!errors.isEmpty()) {
    // There are errors. Render the form again with sanitized values and error messages.
    res.render("genre_form", {
      title: "Update Genre",
      genre: genre,
      errors: errors.array(),
    });
    return;
  } else {
    // Data from form is valid. Update the record.
    await Genre.findByIdAndUpdate(req.params.id, genre);
    res.redirect(genre.url);
  }
})
]
