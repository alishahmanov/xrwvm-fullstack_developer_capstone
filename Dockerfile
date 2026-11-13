FROM node:22-bookworm-slim AS frontend
WORKDIR /build
COPY server/frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY server/frontend/public ./public
COPY server/frontend/src ./src
RUN CI=true npm run build

FROM python:3.12-slim
WORKDIR /app
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY server/manage.py ./
COPY server/djangoproj ./djangoproj
COPY server/djangoapp ./djangoapp
COPY server/database/data/car_records.json ./database/data/car_records.json
COPY --from=frontend /build/build ./frontend/build
COPY server/frontend/static ./frontend/static
RUN python manage.py collectstatic --noinput
ENV DJANGO_DEBUG=false DJANGO_DB_PATH=/data/db.sqlite3
RUN mkdir /data && chmod g+rwx /data
EXPOSE 8080
CMD ["sh", "-c", "python manage.py migrate && python manage.py shell -c 'from djangoapp.populate import initiate; initiate()' && exec gunicorn --bind 0.0.0.0:8080 djangoproj.wsgi:application"]
