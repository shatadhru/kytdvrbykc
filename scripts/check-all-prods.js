// Find if any product has invalid fields or check all products
const prods = db.products.find().toArray();
print("Total products:", prods.length);

for (let i = 0; i < prods.length; i++) {
  const p = prods[i];
  try {
    // Check if JSON.stringify works on the raw doc or if BSON serialization fails
    p._id.toHexString();
    if (p.thumbnail && p.thumbnail instanceof ObjectId) {
      p.thumbnail.toHexString();
    }
    if (p.teacher && p.teacher instanceof ObjectId) {
      p.teacher.toHexString();
    }
    if (p.category && p.category instanceof ObjectId) {
      p.category.toHexString();
    }
    if (p.instructor && p.instructor instanceof ObjectId) {
      p.instructor.toHexString();
    }
  } catch (err) {
    print("Error in product " + p.title + " (slug: " + p.slug + "):", err.message);
  }
}

// Check categories
const cats = db.categories.find().toArray();
print("Total categories:", cats.length);
for (const c of cats) {
  try {
    c._id.toHexString();
  } catch (err) {
    print("Error in category " + c.title + ":", err.message);
  }
}

// Check subjects
const subs = db.subjects.find().toArray();
print("Total subjects in collection:", subs.length);

// Print keys of first 2 products
printjson(prods.slice(0, 2).map(p => ({
  _id: p._id.toString(),
  title: p.title,
  slug: p.slug,
  teacher: p.teacher,
  category: p.category,
  subjectsCount: p.subjects ? p.subjects.length : 0,
  subjectsSample: p.subjects && p.subjects[0] ? {
    id: p.subjects[0].id,
    idType: typeof p.subjects[0].id,
    _id: p.subjects[0]._id,
    lessonsCount: p.subjects[0].lessons ? p.subjects[0].lessons.length : 0,
    lessonSample: p.subjects[0].lessons && p.subjects[0].lessons[0] ? {
      id: p.subjects[0].lessons[0].id,
      idType: typeof p.subjects[0].lessons[0].id,
      _id: p.subjects[0].lessons[0]._id
    } : null
  } : null
})));
