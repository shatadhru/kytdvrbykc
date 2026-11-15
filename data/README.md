# LMS Data Export (`utmeducation.com`)

Extracted directly from the live MariaDB database associated with Coolify container `mariadb-ojomaz9snv8urpboggzj96ux` for `utmeducation.com`.

All descriptions, HTML markup, YouTube URLs, and class links have been preserved verbatim without alterations.

---

## Summary of Extracted Data

| File | Records | Description |
| :--- | :--- | :--- |
| [`courses.json`](file:///e:/01111111/data/courses.json) | 32 | All LMS courses with original descriptions, pricing, thumbnail, intro video, levels, and settings. |
| [`topics.json`](file:///e:/01111111/data/topics.json) | 85 | Course topics / modules linking courses to curriculum sections with order and summary. |
| [`lessons.json`](file:///e:/01111111/data/lessons.json) | 2,499 | All lessons with exact descriptions, YouTube URLs, durations, attached PDF links, and batch class links. |
| [`full_curriculum.json`](file:///e:/01111111/data/full_curriculum.json) | 32 Courses | Nested tree: Course &rarr; Topics &rarr; Lessons (with all videos & links) + direct lessons. |
| [`cb_collections.json`](file:///e:/01111111/data/cb_collections.json) | 16 | Content Bank subject collections (e.g. SSC-25 Chemistry, Physics, Math). |
| [`cb_lessons.json`](file:///e:/01111111/data/cb_lessons.json) | 279 | Content Bank lessons with video links and descriptions. |
| [`quizzes.json`](file:///e:/01111111/data/quizzes.json) | 3 | Quizzes, passing criteria, time limits, and associated questions & answers. |
| [`users.json`](file:///e:/01111111/data/users.json) | 2,087 | User accounts with email, names, roles, phone numbers, and registration timestamps. |
| [`enrollments.json`](file:///e:/01111111/data/enrollments.json) | 1,353 | Student course enrollments linking User ID to Course ID with enrollment status and dates. |
| [`summary.json`](file:///e:/01111111/data/summary.json) | 1 | Metadata and record counts of the export. |

---

## Important Integrity Notes

1. **Course & Lesson Descriptions:**
   - Raw description fields (`description` / `post_content`) are 100% untampered and preserved exactly as authored in WordPress/Tutor LMS.
2. **Video & YouTube Links:**
   - Decoded from native serialized `_video` metadata into structured `video.youtube_url` alongside playtime and raw meta arrays.
3. **Class Links & Community Links:**
   - Batch Facebook group links, Zoom/Meet links, and resource links are preserved within each lesson's `description` and pre-indexed into `class_links_in_content` for quick reference.
4. **Attachments:**
   - Attachment IDs and their full download URLs (`.pdf`, etc.) are mapped under `attachments`.

