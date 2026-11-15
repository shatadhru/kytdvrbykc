import json

with open('data/courses.json', 'r', encoding='utf-8') as f:
    courses = json.load(f)

with open('data/lessons.json', 'r', encoding='utf-8') as f:
    lessons = json.load(f)

lessons_by_cid = {}
for l in lessons:
    cid = l.get('course_id')
    lessons_by_cid[cid] = lessons_by_cid.get(cid, 0) + 1

print(f"Total courses in export: {len(courses)}")
for c in courses:
    cid = c['id']
    cnt = lessons_by_cid.get(cid, 0)
    print(f"ID: {cid} | Status: {c['status']} | Lessons: {cnt} | Slug: {c.get('slug')} | Title: {c['title']}")

