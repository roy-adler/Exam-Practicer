FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css app.js questions.json /usr/share/nginx/html/
