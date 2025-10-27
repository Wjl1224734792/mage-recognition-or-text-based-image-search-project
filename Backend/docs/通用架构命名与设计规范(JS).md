# 通用架构命名与设计规范(JS)

## 一、核心原则

本规范旨在建立统一的架构认知框架，提升代码的可读性、可维护性和协作效率。所有命名和设计应遵循以下基本原则：

1. **一致性**：相同类型的组件采用统一的命名模式和设计模式
2. **语义化**：名称准确反映组件的职责边界和业务含义
3. **简洁性**：避免冗余修饰，在清晰的前提下保持简洁
4. **可扩展性**：设计应支持功能的平滑扩展和演进
5. **分层明确**：各层职责清晰，关注点分离

## 二、架构分层与职责划分

基于单一职责原则，将系统划分为以下逻辑层次：

### 核心业务层
- **路由层** (Routes)：定义API端点与处理逻辑的映射关系
- **处理层** (Handlers)：协调请求生命周期，处理协议相关逻辑
- **服务层** (Services)：封装核心业务规则和复杂业务流程
- **数据访问层** (Data Access)：提供统一的数据读写接口

### 基础设施层
- **数据库层** (Database)：负责数据持久化、查询优化和事务管理
- **验证层** (Validation)：定义数据合法性契约和校验规则
- **工具层** (Utilities)：提供跨领域通用能力和基础服务
- **中间件层** (Middleware)：处理横切关注点和通用拦截逻辑
- **配置层** (Configuration)：管理应用配置和环境参数
- **类型定义** (Type Definitions)：通过JSDoc定义数据结构和接口契约

## 三、数据库层设计规范

### 数据建模原则
- **表命名**：使用复数形式表示实体集合，多单词采用蛇形命名法
- **字段命名**：采用蛇形命名法，避免使用数据库保留字
- **关系设计**：明确的一对一、一对多、多对多关系应通过命名体现
- **约束命名**：主键、外键、索引等约束应包含表名和字段信息

### 数据库操作规范
- **查询封装**：复杂查询逻辑应封装在特定的数据访问方法中
- **事务管理**：跨表操作必须使用事务保证数据一致性
- **性能考虑**：频繁查询的字段应建立适当索引，命名体现索引用途

## 四、通用命名模式

### 文件组织模式
采用"资源.职责"的命名约定，明确文件的功能归属：
- 路由定义：`[资源].routes.js`
- 请求处理：`[资源].handler.js`
- 业务服务：`[资源].service.js`
- 数据访问：`[资源].data.js`
- 数据模型：`[资源].model.js`
- 验证规则：`[资源].schema.js`
- 工具函数：`[功能].util.js`
- 中间件：`[功能].middleware.js`

### 代码元素命名规范
- **变量**：小驼峰格式，布尔值使用`is`/`has`/`can`前缀明确语义
- **常量**：全大写蛇形格式，体现不可变性
- **函数/方法**：采用"动作+资源"的动词短语结构，明确操作意图
- **类**：大驼峰格式，体现封装的功能范畴和职责边界

## 五、跨层协作规范

确保系统各层之间的协作清晰有序：

1. **垂直依赖**：上层可依赖下层，禁止下层依赖上层，保持单向依赖关系
2. **接口契约**：层间通过明确定义的接口进行交互，避免实现细节暴露
3. **数据转换**：层间数据传输应通过明确的转换过程，保持各层数据模型的独立性

## 六、API接口设计规范

### 资源导向设计
- **资源标识**：使用复数名词表示资源集合，多单词资源采用连字符连接
- **操作表达**：通过HTTP方法表达操作意图，URL路径保持简洁和资源导向
- **状态管理**：资源状态变更通过专门的端点处理，保持API的幂等性

### 数据交互格式
- **请求规范**：查询参数、请求体字段采用统一的命名风格
- **响应标准**：成功和错误响应遵循统一的格式规范
- **版本管理**：API变更通过版本控制保证向后兼容

## 七、ES6模块规范

### 导入/导出约定

#### 默认导出
```javascript
// services/user.service.js
class UserService {
  constructor() {
    // 初始化逻辑
  }
  
  async createUser(userData) {
    // 创建用户逻辑
  }
}

export default UserService;
```

#### 命名导出
```javascript
// utils/validation.util.js
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

export const validationRules = {
  email: isValidEmail,
  required: isRequired
};
```

#### 索引文件组织
```javascript
// services/index.js
export { default as UserService } from './user.service.js';
export { default as AuthService } from './auth.service.js';
export { default as ProductService } from './product.service.js';
```

### 模块导入模式

#### 核心模块导入
```javascript
// handlers/user.handler.js
import UserService from '../services/user.service.js';
import { validateUser } from '../schemas/user.schema.js';
import { APIResponse } from '../utils/response.util.js';

export const createUser = async (req, res) => {
  try {
    const validation = validateUser(req.body);
    if (!validation.isValid) {
      return res.status(400).json(APIResponse.error(validation.errors));
    }
    
    const user = await UserService.create(req.body);
    return res.status(201).json(APIResponse.success(user));
  } catch (error) {
    return res.status(500).json(APIResponse.error(error.message));
  }
};
```

#### 配置管理
```javascript
// config/database.js
export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  dialect: 'postgres'
};

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
};
```

#### 中间件模式
```javascript
// middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { APIResponse } from '../utils/response.util.js';

export const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json(APIResponse.error('访问令牌缺失'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(APIResponse.error('令牌无效'));
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(APIResponse.error('未认证'));
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json(APIResponse.error('权限不足'));
    }
    
    next();
  };
};
```

### JSDoc类型提示

#### 服务层类型定义
```javascript
// services/user.service.js

/**
 * @typedef {Object} User
 * @property {string} id - 用户ID
 * @property {string} name - 用户名
 * @property {string} email - 邮箱
 * @property {string} role - 用户角色
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */

/**
 * @typedef {Object} CreateUserData
 * @property {string} name - 用户名
 * @property {string} email - 邮箱
 * @property {string} password - 密码
 * @property {string} [role] - 用户角色
 */

class UserService {
  /**
   * 创建用户
   * @param {CreateUserData} userData - 用户数据
   * @returns {Promise<User>} 创建的用户
   */
  async create(userData) {
    // 实现逻辑
  }
  
  /**
   * 根据ID查找用户
   * @param {string} userId - 用户ID
   * @returns {Promise<User|null>} 用户对象或null
   */
  async findById(userId) {
    // 实现逻辑
  }
}

export default UserService;
```

#### API响应类型
```javascript
// utils/response.util.js

/**
 * API响应包装器
 * @typedef {Object} APIResponse
 * @property {boolean} success - 请求是否成功
 * @property {any} [data] - 响应数据
 * @property {string} [message] - 响应消息
 * @property {any} [errors] - 错误信息
 */

/**
 * 创建成功响应
 * @param {any} data - 响应数据
 * @param {string} [message] - 成功消息
 * @returns {APIResponse}
 */
export const APIResponse = {
  success: (data, message = '操作成功') => ({
    success: true,
    data,
    message
  }),
  
  error: (errors, message = '操作失败') => ({
    success: false,
    message,
    errors
  })
};
```

## 八、目录结构示例

```
src/
├── config/
│   ├── database.js
│   ├── app.js
│   └── index.js
├── routes/
│   ├── user.routes.js
│   ├── auth.routes.js
│   └── index.js
├── handlers/
│   ├── user.handler.js
│   └── auth.handler.js
├── services/
│   ├── user.service.js
│   ├── auth.service.js
│   └── index.js
├── data/
│   ├── user.data.js
│   └── index.js
├── middleware/
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   └── index.js
├── schemas/
│   ├── user.schema.js
│   └── auth.schema.js
├── utils/
│   ├── response.util.js
│   ├── validation.util.js
│   └── index.js
└── app.js
```

## 九、维护与演进规范

### 日常开发维护
1. **功能扩展**：严格遵循现有架构体系，保持设计的对称性和一致性
2. **组件废弃**：明确标记废弃组件，提供清晰的迁移路径和替代方案
3. **技术债务**：定期评估和重构，控制技术债务的积累

### 规范演进管理
1. **渐进式改进**：规范调整应考虑现有代码库的兼容性
2. **变更沟通**：重大架构变更需经过团队评审和共识
3. **文档同步**：规范更新应及时反映在项目文档中

## 十、价值与总结

本规范通过建立清晰的架构分层和统一的命名体系，为后端服务开发提供可扩展的设计框架：

- **降低认知成本**：一致的命名和明确的分层使系统结构一目了然
- **提升协作效率**：统一的规范减少技术分歧和沟通成本
- **保障代码质量**：清晰的职责边界促进代码的可测试性和可维护性
- **支持系统演进**：良好的架构设计为长期维护和功能扩展奠定基础

规范应作为团队的技术共识，可根据具体业务需求和技术特点进行适当调整，但需确保在项目范围内的统一性和一致性。