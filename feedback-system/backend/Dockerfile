FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建上传目录
RUN mkdir -p uploads/screenshots

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
