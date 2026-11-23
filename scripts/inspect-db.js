const u = db.users.findOne();
const m = db.media.findOne();
const p = db.products.findOne();
const t = db.teachers.findOne();
print("User _id is ObjectId?:", u ? (u._id instanceof ObjectId) : "no user");
print("Media _id is ObjectId?:", m ? (m._id instanceof ObjectId) : "no media");
print("Product _id is ObjectId?:", p ? (p._id instanceof ObjectId) : "no product");
print("Teacher _id is ObjectId?:", t ? (t._id instanceof ObjectId) : "no teacher");

printjson({
  sampleUser: u ? { _id: u._id, email: u.email } : null,
  sampleTeacher: t ? { _id: t._id, name: t.name } : null,
  sampleProduct: p ? { _id: p._id, title: p.title, instructor: p.instructor, teacher: p.teacher, category: p.category, thumbnail: p.thumbnail } : null
});
