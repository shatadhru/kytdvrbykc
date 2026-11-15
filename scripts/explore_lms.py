import subprocess

def run_query(sql):
    cmd = [
        "docker", "exec", "-i", "mariadb-ojomaz9snv8urpboggzj96ux",
        "mariadb", "-u", "buwHk4n1ByO5JwVq", "-pT920ijAJSAM06rOFmInK6sUXPIHgysMX",
        "wordpress", "-e", sql, "--batch", "--raw"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0: return []
    lines = res.stdout.strip().split("\n")
    if not lines or not lines[0]: return []
    headers = lines[0].split("\t")
    return [dict(zip(headers, l.split("\t"))) for l in lines[1:] if l]

print("=== CB-COLLECTION SAMPLE ===")
cb_col = run_query("SELECT ID, post_title, post_status, post_parent FROM wp_posts WHERE post_type='cb-collection' LIMIT 5;")
for c in cb_col:
    print(c)

print("=== CB-LESSON SAMPLE ===")
cb_l = run_query("SELECT ID, post_title, post_status, post_parent FROM wp_posts WHERE post_type='cb-lesson' LIMIT 5;")
for l in cb_l:
    print(l)
    meta = run_query(f"SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id={l['ID']} LIMIT 5;")
    for m in meta:
        print("  cb meta:", m['meta_key'], "->", m['meta_value'][:50])
