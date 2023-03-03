![License](https://img.shields.io/github/license/codeshare-project/server)
![Issues](https://img.shields.io/github/issues/codeshare-project/server)
![Top language](https://img.shields.io/github/languages/top/codeshare-project/server)
![Last commit](https://img.shields.io/github/last-commit/codeshare-project/server)

![CodeShare banner](https://i.imgur.com/8KSgw8s.png)
<h1 align="center">🪄 Server</h1>
<h3 align="center">CodeShare backend, made with Fastify + Typescript 💙</h3>
<hr>

## Summary
1. [Classic installation](#classic-installation)
2. [Docker installation](#docker-installation)
3. [Support](#support)

## Classic installation
### Requirements
- [Node.js](https://nodejs.org/en/)
- [MariaDB](https://mariadb.org/) or [MySQL](https://www.mysql.com/fr/)

### 🪄 Installation
```shell
git clone https://github.com/codeshare-project/server.git
cd server
npm install # or yarn install
```

### ⚙️ Configuration
```shell
cp .env.example .env
```
Then, edit the `.env` file with your favorite editor.

### 🎉 Run
Development mode:
```shell
npm run dev # or yarn dev
```
Production mode:
```shell
npm run build # or yarn build
npm run start # or yarn start
```

## Docker installation
### Requirements
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/) (optional)

### Using docker 🐋
You need a MariaDB or MySQL database.
```shell
sudo docker run -d --name codeshare-server -p 3000:3000 -e NODE_ENV=production -e DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE" -e SERVER_PORT=3000 -e SITE_NAME=https://mysite.com SITE_NAME_SHORT=mysite.com ghcr.io/codeshare-project/server:latest
```

### Using docker-compose
```yaml
services:
  codeshare-server:
    image: ghcr.io/codeshare-project/server:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL="mysql://myUser:changeMe@HOST:3306/codeshare"
      - SERVER_PORT=3000
      - SITE_NAME=https://mysite.com
      - SITE_NAME_SHORT=mysite.com
   
  mariadb:
    image: mariadb
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=superPassword
      - MYSQL_DATABASE=codeshare
      - MYSQL_USER=myUser
      - MYSQL_PASSWORD=changeMe
    volumes:
      - data:/var/lib/mysql

volumes:
  data:
  ```

## Environment variables
| Name | Description                        | Default value |
|---|------------------------------------|---------------|
| `NODE_ENV` | Node environment                   | ---           |
| `DATABASE_URL` | Database URL                       | ---           |
| `SERVER_PORT` | Server port                        | 3000          |
| `SERVER_HOST` | Server host                        | 0.0.0.0       |
| `SITE_NAME` | Site name                          | ---           |
| `SITE_NAME_SHORT` | Site name short (without protocol) | ---           |
| `FASTIFY_JWT_SECRET` | JWT secret                         | secret        |
| `FASTIFY_JWT_EXPIRES_IN` | JWT expires in                     | 1h           |

## Support
**📧 Contact:** <a href="mailto:codeshare-project@protonmail.com">codeshare-project@protonmail.com</a> <br>
*Powered by [CodeShare](https://github.com/codeshare-project)*
