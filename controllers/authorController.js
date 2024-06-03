const Author = require("../models/author");
const Book = require("../models/book");
const {body, validationResult}=require("express-validator");
const asyncHandler = require("express-async-handler");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const allauthor= await Author.find({}).sort({family_name:1}).exec();
  res.render("author_list", { title: "Author List", author_list: allauthor });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    // No results.
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_detail", {
    title: "Author Detail",
    author: author,
    author_books: allBooksByAuthor,
  });
});

// Display Author create form on GET.
exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.render("author_form", { title: "Create Author" });      
});

// Handle Author create on POST.
exports.author_create_post = [body("first_name").trim().isLength({min:1}).escape().withMessage("First name must be specified.").isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
  body("family_name").trim().isLength({min:1}).escape().withMessage("Family name must be specified.").isAlphanumeric().withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth","Invalid date of birth").optional({checkFalsy:true}).isISO8601().toDate(),
  body("date_of_death","Invalid date of death").optional({checkFalsy:true}).isISO8601().toDate(),
  asyncHandler(async (req,res,next)=>{
    const error=validationResult(req);

    const author=new Author({first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death
    })
    if(!error.isEmpty()){
      res.render("author_form",{title:"Create_Author", author:author, errors:error.array()})
      return;
    }
    else{
      await author.save();
      res.redirect(author.url)
    }
  })
]

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author,allbooks]=await Promise.all([Author.findById(req.params.id).exec(),Book.find({author:req.params.id},"title summary").exec()])
  if(author==null){
    res.redirect("/catalog/authors")
  }
  res.render("author_delete",{title:"Delete Author", author:author, author_books:allbooks})
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);
  if(allBooksByAuthor.length>0){
    res.render("author_delete",{title:"Delete Author", author:author, author_books:allBooksByAuthor})
  }
  await Author.findByIdAndDelete(req.params.id).exec();
  res.redirect("catalog/authors");
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author=await Author.findById(req.params.id).exec();
  if(author==null){
    res.redirect("/catalog/authors")
  }
  res.render("author_form",{title:"Update Author", author:author})
});

// Handle Author update on POST.
exports.author_update_post = [  body("first_name")
.trim()
.isLength({ min: 1 })
.escape()
.withMessage("First name must be specified.")
.isAlphanumeric()
.withMessage("First name has non-alphanumeric characters."),
body("family_name")
.trim()
.isLength({ min: 1 })
.escape()
.withMessage("Family name must be specified.")
.isAlphanumeric()
.withMessage("Family name has non-alphanumeric characters."),
body("date_of_birth", "Invalid date of birth")
.optional({ values: "falsy" })
.isISO8601()
.toDate(),
body("date_of_death", "Invalid date of death")
.optional({ values: "falsy" })
.isISO8601()
.toDate(),
asyncHandler(async (req, res, next) => {
  const error=validationResult(req);
  const author = new Author({
    first_name: req.body.first_name,
    family_name: req.body.family_name,
    date_of_birth: req.body.date_of_birth,
    date_of_death: req.body.date_of_death,
    _id: req.params.id,
  });    
  if (!error.isEmpty()) {
    // There are errors. Render the form again with sanitized values and error messages.
    res.render("author_form", {
      title: "Update Author",
      author: author,
      errors: error.array(),
    });
    return;
  }

  else{
    await Author.findByIdAndUpdate(req.params.id,author).exec();
    res.redirect(author.url);
  }
})
]
