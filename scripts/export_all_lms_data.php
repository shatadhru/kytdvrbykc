<?php
// Prevent error output polluting JSON
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

require_once '/var/www/html/wp-load.php';

global $wpdb;

echo "Starting LMS Data Extraction from utmeducation.com MariaDB...\n";

// 1. Fetch Users
echo "Extracting users...\n";
$users_raw = $wpdb->get_results("SELECT ID, user_login, user_email, user_nicename, display_name, user_registered, user_status FROM {$wpdb->users} ORDER BY ID ASC", ARRAY_A);
$users = [];
$user_map = [];

foreach ($users_raw as $u) {
    $uid = (int)$u['ID'];
    $first_name = get_user_meta($uid, 'first_name', true);
    $last_name = get_user_meta($uid, 'last_name', true);
    $phone = get_user_meta($uid, 'phone_number', true) ?: get_user_meta($uid, 'billing_phone', true) ?: get_user_meta($uid, 'mobile_number', true) ?: '';
    $caps = get_user_meta($uid, $wpdb->prefix . 'capabilities', true);
    $roles = is_array($caps) ? array_keys($caps) : [];

    $user_data = [
        'id' => $uid,
        'username' => $u['user_login'],
        'email' => $u['user_email'],
        'display_name' => $u['display_name'],
        'first_name' => $first_name,
        'last_name' => $last_name,
        'phone' => $phone,
        'roles' => $roles,
        'registered_at' => $u['user_registered']
    ];
    $users[] = $user_data;
    $user_map[$uid] = $user_data;
}
echo "Total users extracted: " . count($users) . "\n";

// Helper to extract links from content without altering content
function extract_links_from_text($text) {
    if (empty($text)) return [];
    $pattern = '/https?:\/\/[^\s<"\'\)]+/i';
    preg_match_all($pattern, $text, $matches);
    return array_values(array_unique($matches[0] ?? []));
}

// 2. Fetch Courses
echo "Extracting courses...\n";
$courses_raw = $wpdb->get_results("SELECT ID, post_title, post_name, post_status, post_content, post_excerpt, post_author, post_date, post_modified FROM {$wpdb->posts} WHERE post_type = 'courses' ORDER BY ID ASC", ARRAY_A);
$courses = [];
$course_map = [];

foreach ($courses_raw as $c) {
    $cid = (int)$c['ID'];
    $thumb_id = get_post_meta($cid, '_thumbnail_id', true);
    $thumb_url = $thumb_id ? wp_get_attachment_url($thumb_id) : '';

    $video_meta = get_post_meta($cid, '_video', true);
    $video_info = is_array($video_meta) ? $video_meta : (is_string($video_meta) ? maybe_unserialize($video_meta) : []);

    $intro_youtube = '';
    if (!empty($video_info['source_youtube'])) {
        $intro_youtube = $video_info['source_youtube'];
    } elseif (!empty($video_info['source_external_url'])) {
        $intro_youtube = $video_info['source_external_url'];
    }

    $price_type = get_post_meta($cid, '_tutor_course_price_type', true) ?: 'free';
    $price = get_post_meta($cid, 'tutor_course_price', true) ?: '0';
    $sale_price = get_post_meta($cid, 'tutor_course_sale_price', true) ?: '';
    $duration = get_post_meta($cid, '_course_duration', true);
    $level = get_post_meta($cid, '_tutor_course_level', true) ?: '';
    $benefits = get_post_meta($cid, '_tutor_course_benefits', true) ?: '';
    $requirements = get_post_meta($cid, '_tutor_course_requirements', true) ?: '';
    $target_audience = get_post_meta($cid, '_tutor_course_target_audience', true) ?: '';
    $material_includes = get_post_meta($cid, '_tutor_course_material_includes', true) ?: '';
    $settings = get_post_meta($cid, '_tutor_course_settings', true);

    $author_id = (int)$c['post_author'];
    $author_info = $user_map[$author_id] ?? ['id' => $author_id, 'display_name' => 'Unknown', 'email' => ''];

    // Extract any class/group links found in course content/description
    $content_links = extract_links_from_text($c['post_content']);

    $course_data = [
        'id' => $cid,
        'title' => $c['post_title'],
        'slug' => $c['post_name'],
        'status' => $c['post_status'],
        'description' => $c['post_content'], // DO NOT CHANGE ANY DESCRIPTION
        'excerpt' => $c['post_excerpt'],
        'author' => $author_info,
        'created_at' => $c['post_date'],
        'updated_at' => $c['post_modified'],
        'pricing' => [
            'type' => $price_type,
            'price' => $price,
            'sale_price' => $sale_price
        ],
        'level' => $level,
        'duration' => is_array($duration) ? $duration : maybe_unserialize($duration),
        'thumbnail' => [
            'id' => $thumb_id ? (int)$thumb_id : null,
            'url' => $thumb_url ?: null
        ],
        'intro_video' => [
            'source' => $video_info['source'] ?? '',
            'youtube_url' => $intro_youtube,
            'raw' => $video_info
        ],
        'additional_info' => [
            'benefits' => $benefits,
            'requirements' => $requirements,
            'target_audience' => $target_audience,
            'materials_included' => $material_includes,
            'settings' => is_array($settings) ? $settings : maybe_unserialize($settings)
        ],
        'detected_links_in_description' => $content_links
    ];

    $courses[] = $course_data;
    $course_map[$cid] = $course_data;
}
echo "Total courses extracted: " . count($courses) . "\n";

// 3. Fetch Topics
echo "Extracting topics...\n";
$topics_raw = $wpdb->get_results("SELECT ID, post_title, post_name, post_status, post_content, post_parent, menu_order FROM {$wpdb->posts} WHERE post_type = 'topics' ORDER BY post_parent ASC, menu_order ASC, ID ASC", ARRAY_A);
$topics = [];
$topic_map = [];

foreach ($topics_raw as $t) {
    $tid = (int)$t['ID'];
    $parent_cid = (int)$t['post_parent'];
    $topic_data = [
        'id' => $tid,
        'course_id' => $parent_cid,
        'title' => $t['post_title'],
        'slug' => $t['post_name'],
        'status' => $t['post_status'],
        'summary' => $t['post_content'], // DO NOT CHANGE ANY SUMMARY
        'order' => (int)$t['menu_order']
    ];
    $topics[] = $topic_data;
    $topic_map[$tid] = $topic_data;
}
echo "Total topics extracted: " . count($topics) . "\n";

// 4. Fetch Lessons
echo "Extracting lessons...\n";
$lessons_raw = $wpdb->get_results("SELECT ID, post_title, post_name, post_status, post_content, post_excerpt, post_parent, menu_order, post_date, post_modified FROM {$wpdb->posts} WHERE post_type = 'lesson' ORDER BY post_parent ASC, menu_order ASC, ID ASC", ARRAY_A);
$lessons = [];
$lesson_map = [];

foreach ($lessons_raw as $l) {
    $lid = (int)$l['ID'];
    $parent_id = (int)$l['post_parent']; // Usually topic ID

    // Find course ID
    $course_id = 0;
    $topic_id = 0;

    if ($parent_id > 0 && isset($topic_map[$parent_id])) {
        $topic_id = $parent_id;
        $course_id = $topic_map[$parent_id]['course_id'];
    } elseif ($parent_id > 0 && isset($course_map[$parent_id])) {
        // If parent is directly course
        $course_id = $parent_id;
        $topic_id = 0;
    } else {
        // Check meta
        $meta_cid = get_post_meta($lid, '_tutor_course_id_for_lesson', true);
        if ($meta_cid) {
            $course_id = (int)$meta_cid;
        }
        $topic_id = $parent_id;
    }

    // Video metadata
    $video_meta = get_post_meta($lid, '_video', true);
    $video_info = is_array($video_meta) ? $video_meta : (is_string($video_meta) ? maybe_unserialize($video_meta) : []);

    $youtube_url = '';
    if (!empty($video_info['source_youtube'])) {
        $youtube_url = $video_info['source_youtube'];
    } elseif (!empty($video_info['source_external_url'])) {
        $youtube_url = $video_info['source_external_url'];
    }

    // Attachments
    $attach_meta = get_post_meta($lid, '_tutor_attachments', true);
    $attach_ids = is_array($attach_meta) ? $attach_meta : (is_string($attach_meta) ? maybe_unserialize($attach_meta) : []);
    $attachments = [];
    if (is_array($attach_ids)) {
        foreach ($attach_ids as $aid) {
            $aid = (int)$aid;
            if ($aid > 0) {
                $attachments[] = [
                    'id' => $aid,
                    'title' => get_the_title($aid),
                    'url' => wp_get_attachment_url($aid)
                ];
            }
        }
    }

    // Extract any class links / zoom links / youtube links found in the lesson content
    $content_links = extract_links_from_text($l['post_content']);

    // If youtube_url is empty in _video meta, check if there's a youtube url in post_content
    if (empty($youtube_url)) {
        foreach ($content_links as $clk) {
            if (strpos($clk, 'youtu.be') !== false || strpos($clk, 'youtube.com') !== false) {
                $youtube_url = $clk;
                break;
            }
        }
    }

    $is_preview = get_post_meta($lid, '_is_preview', true) ?: get_post_meta($lid, '_tutor_is_preview', true);

    $lesson_data = [
        'id' => $lid,
        'title' => $l['post_title'],
        'slug' => $l['post_name'],
        'status' => $l['post_status'],
        'course_id' => $course_id,
        'topic_id' => $topic_id,
        'order' => (int)$l['menu_order'],
        'is_preview' => ($is_preview === 'yes' || $is_preview === '1' || $is_preview === true),
        'description' => $l['post_content'], // DO NOT CHANGE ANY DESCRIPTION OR CLASS LINKS
        'excerpt' => $l['post_excerpt'],
        'video' => [
            'source' => $video_info['source'] ?? ($youtube_url ? 'youtube' : ''),
            'youtube_url' => $youtube_url,
            'duration_sec' => $video_info['duration_sec'] ?? null,
            'playtime' => $video_info['playtime'] ?? null,
            'raw_video_data' => $video_info
        ],
        'class_links_in_content' => $content_links,
        'attachments' => $attachments,
        'created_at' => $l['post_date'],
        'updated_at' => $l['post_modified']
    ];

    $lessons[] = $lesson_data;
    $lesson_map[$lid] = $lesson_data;
}
echo "Total lessons extracted: " . count($lessons) . "\n";

// 5. Fetch Content Bank (cb-collection & cb-lesson)
echo "Extracting content bank collections and lessons...\n";
$cb_cols_raw = $wpdb->get_results("SELECT ID, post_title, post_name, post_status, post_content FROM {$wpdb->posts} WHERE post_type = 'cb-collection' ORDER BY ID ASC", ARRAY_A);
$cb_collections = [];
foreach ($cb_cols_raw as $cbc) {
    $cb_collections[] = [
        'id' => (int)$cbc['ID'],
        'title' => $cbc['post_title'],
        'slug' => $cbc['post_name'],
        'status' => $cbc['post_status'],
        'description' => $cbc['post_content']
    ];
}

$cb_lessons_raw = $wpdb->get_results("SELECT ID, post_title, post_name, post_status, post_content, post_parent, menu_order FROM {$wpdb->posts} WHERE post_type = 'cb-lesson' ORDER BY post_parent ASC, menu_order ASC, ID ASC", ARRAY_A);
$cb_lessons = [];
foreach ($cb_lessons_raw as $cbl) {
    $cbl_id = (int)$cbl['ID'];
    $video_meta = get_post_meta($cbl_id, '_video', true);
    $video_info = is_array($video_meta) ? $video_meta : (is_string($video_meta) ? maybe_unserialize($video_meta) : []);
    $yt = $video_info['source_youtube'] ?? ($video_info['source_external_url'] ?? '');

    $content_links = extract_links_from_text($cbl['post_content']);
    if (empty($yt)) {
        foreach ($content_links as $clk) {
            if (strpos($clk, 'youtu.be') !== false || strpos($clk, 'youtube.com') !== false) {
                $yt = $clk;
                break;
            }
        }
    }

    $cb_lessons[] = [
        'id' => $cbl_id,
        'collection_id' => (int)$cbl['post_parent'],
        'title' => $cbl['post_title'],
        'slug' => $cbl['post_name'],
        'status' => $cbl['post_status'],
        'order' => (int)$cbl['menu_order'],
        'description' => $cbl['post_content'],
        'youtube_url' => $yt,
        'video_data' => $video_info,
        'detected_links' => $content_links
    ];
}
echo "Total CB collections: " . count($cb_collections) . ", CB lessons: " . count($cb_lessons) . "\n";

// 6. Fetch Quizzes & Questions
echo "Extracting quizzes and questions...\n";
$quizzes_raw = $wpdb->get_results("SELECT ID, post_title, post_name, post_status, post_content, post_parent FROM {$wpdb->posts} WHERE post_type = 'tutor_quiz' ORDER BY ID ASC", ARRAY_A);
$quizzes = [];
foreach ($quizzes_raw as $q) {
    $qid = (int)$q['ID'];
    $qsettings = get_post_meta($qid, 'tutor_quiz_option', true);

    // Questions
    $questions_raw = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}tutor_quiz_questions WHERE quiz_id = %d ORDER BY question_order ASC", $qid), ARRAY_A);
    $questions = [];
    foreach ($questions_raw as $qn) {
        $qn_id = (int)$qn['question_id'];
        $answers_raw = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}tutor_quiz_question_answers WHERE belongs_question_id = %d ORDER BY answer_order ASC", $qn_id), ARRAY_A);
        $qn['answers'] = $answers_raw;
        $questions[] = $qn;
    }

    $quizzes[] = [
        'id' => $qid,
        'title' => $q['post_title'],
        'slug' => $q['post_name'],
        'status' => $q['post_status'],
        'topic_id' => (int)$q['post_parent'],
        'description' => $q['post_content'],
        'settings' => is_array($qsettings) ? $qsettings : maybe_unserialize($qsettings),
        'questions' => $questions
    ];
}
echo "Total quizzes extracted: " . count($quizzes) . "\n";

// 7. Fetch Enrollments
echo "Extracting enrollments...\n";
$enrollments_raw = $wpdb->get_results("SELECT ID, post_author, post_parent, post_status, post_date FROM {$wpdb->posts} WHERE post_type = 'tutor_enrolled' ORDER BY ID ASC", ARRAY_A);
$enrollments = [];
foreach ($enrollments_raw as $en) {
    $uid = (int)$en['post_author'];
    $cid = (int)$en['post_parent'];
    $enrollments[] = [
        'enrollment_id' => (int)$en['ID'],
        'user_id' => $uid,
        'user_email' => $user_map[$uid]['email'] ?? null,
        'user_name' => $user_map[$uid]['display_name'] ?? null,
        'course_id' => $cid,
        'course_title' => $course_map[$cid]['title'] ?? null,
        'status' => $en['post_status'],
        'enrolled_at' => $en['post_date']
    ];
}
echo "Total enrollments extracted: " . count($enrollments) . "\n";

// 8. Build Full Hierarchical Course Curriculum Tree
echo "Building hierarchical course curriculum tree...\n";
$curriculum_tree = [];

// Index topics by course_id
$topics_by_course = [];
foreach ($topics as $tp) {
    $cid = $tp['course_id'];
    if (!isset($topics_by_course[$cid])) {
        $topics_by_course[$cid] = [];
    }
    $topics_by_course[$cid][] = $tp;
}

// Index lessons by topic_id and course_id
$lessons_by_topic = [];
$lessons_by_course_direct = [];
foreach ($lessons as $ls) {
    $tid = $ls['topic_id'];
    $cid = $ls['course_id'];
    if ($tid > 0) {
        if (!isset($lessons_by_topic[$tid])) {
            $lessons_by_topic[$tid] = [];
        }
        $lessons_by_topic[$tid][] = $ls;
    } else {
        if (!isset($lessons_by_course_direct[$cid])) {
            $lessons_by_course_direct[$cid] = [];
        }
        $lessons_by_course_direct[$cid][] = $ls;
    }
}

// Index quizzes by topic_id
$quizzes_by_topic = [];
foreach ($quizzes as $qz) {
    $tid = $qz['topic_id'];
    if (!isset($quizzes_by_topic[$tid])) {
        $quizzes_by_topic[$tid] = [];
    }
    $quizzes_by_topic[$tid][] = $qz;
}

foreach ($courses as $c) {
    $cid = $c['id'];
    $course_topics = $topics_by_course[$cid] ?? [];

    $topics_tree = [];
    foreach ($course_topics as $ct) {
        $tid = $ct['id'];
        $topic_lessons = $lessons_by_topic[$tid] ?? [];
        $topic_quizzes = $quizzes_by_topic[$tid] ?? [];

        $topics_tree[] = [
            'topic_id' => $tid,
            'title' => $ct['title'],
            'summary' => $ct['summary'],
            'order' => $ct['order'],
            'total_lessons' => count($topic_lessons),
            'lessons' => $topic_lessons,
            'quizzes' => $topic_quizzes
        ];
    }

    $direct_lessons = $lessons_by_course_direct[$cid] ?? [];

    $curriculum_tree[] = [
        'course' => $c,
        'curriculum' => [
            'total_topics' => count($topics_tree),
            'topics' => $topics_tree,
            'unassigned_or_direct_lessons' => $direct_lessons
        ]
    ];
}

// 9. Save all data to /tmp JSON files
$out_dir = '/tmp/lms_export';
if (!is_dir($out_dir)) {
    mkdir($out_dir, 0777, true);
}

$files = [
    'courses.json' => $courses,
    'topics.json' => $topics,
    'lessons.json' => $lessons,
    'users.json' => $users,
    'enrollments.json' => $enrollments,
    'quizzes.json' => $quizzes,
    'cb_collections.json' => $cb_collections,
    'cb_lessons.json' => $cb_lessons,
    'full_curriculum.json' => $curriculum_tree,
    'summary.json' => [
        'exported_at' => date('c'),
        'source_domain' => 'utmeducation.com',
        'database' => 'wordpress (mariadb)',
        'counts' => [
            'courses' => count($courses),
            'topics' => count($topics),
            'lessons' => count($lessons),
            'cb_collections' => count($cb_collections),
            'cb_lessons' => count($cb_lessons),
            'quizzes' => count($quizzes),
            'users' => count($users),
            'enrollments' => count($enrollments)
        ]
    ]
];

foreach ($files as $name => $data) {
    $path = $out_dir . '/' . $name;
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    echo "Saved {$name} (" . round(filesize($path) / 1024, 2) . " KB)\n";
}

echo "SUCCESS: LMS Export completed successfully.\n";

