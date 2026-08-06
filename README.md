# Hi, I'm Sazad Ahemad

### DevOps Engineer · Linux Administrator · Cloud Infrastructure

I build, automate and operate reliable infrastructure—from Linux servers and AWS environments to CI/CD pipelines and monitoring platforms.

- Based in Bhubaneswar, India
- Focused on DevOps, system administration and cloud infrastructure
- Experienced with AWS, Terraform, Ansible, Docker, GitLab CI/CD and Jenkins
- Comfortable with Linux administration, monitoring, troubleshooting and web application deployment
- Open to DevOps and System Administration opportunities

## Portfolio

Visit my portfolio at **[connect2sazad.github.io](https://connect2sazad.github.io)** for my complete experience, skills, projects, certifications, presentations and technical articles.

## Technical Skills

| Area | Technologies |
| --- | --- |
| Cloud & Infrastructure as Code | AWS, Terraform, Ansible, EC2, IAM, S3, RDS, Auto Scaling, Load Balancers, CloudWatch |
| DevOps & Automation | GitLab CI/CD, Jenkins, Docker, Git, deployment automation, release support |
| Systems | Linux, Windows Server, server deployment, system monitoring, PowerShell, Python scripting |
| Web Infrastructure | Nginx, PHP-FPM, MySQL, PHP, Laravel, JavaScript, ReactJS, WordPress |

## Featured Projects

### [Infrastructure Monitoring Platform](https://gitlab.com/connect2sazad/prometheus-grafana-infra-setup)

Production-style AWS monitoring infrastructure provisioned with Terraform, configured with Ansible and deployed through GitLab CI/CD. The stack includes Prometheus, Grafana, Alertmanager, Node Exporter, Apache Exporter and cAdvisor.

### [WordPress Infrastructure](https://gitlab.com/connect2sazad/wordpress-with-infra-setup)

Repeatable WordPress deployment on AWS using Terraform, Ansible and Docker, with Linux, Nginx, PHP-FPM and MySQL.

### [Shikayaat](https://github.com/connect2sazad/shikayaat)

A digital complaint-management platform featuring PHP REST APIs, AWS hosting and Jenkins-based deployment automation.

## Connect With Me

- [LinkedIn](https://www.linkedin.com/in/connect2sazad)
- [GitHub](https://github.com/connect2sazad)
- [Email](mailto:mail2sazad@gmail.com)

---

## About This Repository

This README is designed for both my portfolio repository and my GitHub profile repository. GitHub requires these to be two separate repositories:

1. `connect2sazad/connect2sazad.github.io` hosts the portfolio at [connect2sazad.github.io](https://connect2sazad.github.io).
2. `connect2sazad/connect2sazad` displays its `README.md` on my GitHub profile.

The same README can be placed in both repositories, but a single repository cannot perform both GitHub-specific roles.

The website is static and designed for GitHub Pages. Homepage sections are stored in separate JSON files, while blog posts use individual Markdown files.

### Content Structure

- Website pages: `index.html`, `blog.html`, `post.html`, `project.html`
- Homepage content: `data/*.json`
- Blog index: `data/posts/index.json`
- Blog articles: `data/posts/*.md`
- Certificates: `assets/certificates/`
- Presentations: `assets/presentations/`
- Profile photo: `assets/profile.jpg`

### Publish With GitHub Pages

1. Upload the extracted files to the root of the public `connect2sazad.github.io` repository.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder, then save.

GitHub Pages will publish the site at `https://connect2sazad.github.io` and redeploy it whenever changes are pushed to the selected branch.

### Local Preview

Do not preview the site by double-clicking `index.html`, because browser security rules can prevent JSON and Markdown content from loading. Start a local server from the website folder instead:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

### Updating Content

Edit the relevant JSON or Markdown file, commit the change and push it to GitHub. When adding a certificate or presentation, place the file in its corresponding `assets` folder and add its relative path to `data/certifications.json` or `data/presentations.json`.
