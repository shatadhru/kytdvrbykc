import json

with open('data/lessons.json', 'r', encoding='utf-8') as f:
    lessons = json.load(f)

with_links = [l for l in lessons if len(l.get('class_links_in_content', [])) > 0 or len(l.get('description', '')) > 20]
print(f"Total lessons: {len(lessons)}")
print(f"Lessons with description or class links: {len(with_links)}")

for l in with_links[:5]:
    print(f"ID: {l['id']}, Title: {l['title']}")
    print("Links in content:", l.get('class_links_in_content'))
    print("YouTube URL:", l.get('video', {}).get('youtube_url'))
    print("Description:", l.get('description')[:250])
    print("=" * 60)

