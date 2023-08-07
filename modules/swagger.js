const apiDoc = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Joke Station RESTful API",
    description: "Joke Station API 文件 (google登入不在下例)",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  consumes: ["application/json"],
  produces: ["application/json"],
  paths: {
    "/api/user/register": {
      post: {
        tags: ["User"],
        summary: "註冊會員",
        requestBody: {
          description: "name 至少一個字，mail 請輸入真實 mail (會寄送密碼)",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  mail: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        produces: ["application/json"],
        responses: {
          201: {
            description: "註冊成功，要到註冊的信箱中，拿取密碼登入",
            content: {
              "application/json": {
                example: {
                  message: "send mail success",
                  data: {
                    _id: 1035,
                    username: "魯肉飯",
                    email: "admin@mail.com",
                  },
                },
              },
            },
          },
          400: {
            description:
              "This mail is already registered, please log in with this mail 錯誤詳細描述none",
          },
        },
      },
    },
    "/api/user": {
      get: {
        tags: ["User"],
        summary: "取得會員資訊",
        security: [
          {
            bearerAuth: [],
          },
        ],
        produces: ["application/json"],
        responses: {
          200: {
            description: "渲染會員資料頁時用",
            content: {
              "application/json": {
                example: {
                  message: "get user info success",
                  data: {
                    _id: 1035,
                    username: "魯肉飯",
                    email: "admin@mail.com",
                    about_me: "null",
                  },
                },
              },
            },
          },
          400: {
            description: "can not find user 錯誤詳細描述none",
          },
        },
      },
      patch: {
        tags: ["User"],
        summary: "修改會員資訊",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          description:
            "只給要修改的項目即可。若是密碼則必須要輸入2次，密碼至少6個字，可接受英文大小寫、數字、符號!@#&%_",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  mail: {
                    type: "string",
                  },
                  password: {
                    type: "string",
                  },
                  repeatPassword: {
                    type: "string",
                  },
                  aboutMe: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        produces: ["application/json"],
        responses: {
          201: {
            description: "修改會員資訊成功",
            content: {
              "application/json": {
                example: {
                  message: "update user success",
                  data: {
                    username: "魯肉飯",
                    email: "admin@mail.com",
                    about_me: "null",
                    _id: 1035,
                  },
                },
              },
            },
          },
          400: {
            description:
              '"password" with value "12345" fails to match the required pattern: /^[a-zA-Z0-9!@#&%_]{6,20}$/ 錯誤詳細描述ValidationError: "password" with value "12345" fails to match the required pattern: /^[a-zA-Z0-9!@#&%_]{6,20}$/',
          },
        },
      },
      delete: {
        tags: ["User"],
        summary: "刪除會員",
        security: [
          {
            bearerAuth: [],
          },
        ],
        produces: ["application/json"],
        responses: {
          204: {
            description: "刪除會員資訊成功",
          },
          400: {
            description: "can not find user 錯誤詳細描述none",
          },
        },
      },
    },
    "/api/user/article": {
      get: {
        tags: ["User"],
        summary: "取得已儲存文章",
        security: [
          {
            bearerAuth: [],
          },
        ],
        produces: ["application/json"],
        responses: {
          200: {
            description: "渲染己存文章頁時用",
            content: {
              "application/json": {
                example: {
                  message: "get saved article success",
                  data: {
                    _id: 1036,
                    username: "鳴人",
                    saved: [
                      {
                        user_id: 1038,
                        article_id: 2021,
                        _id: 2021,
                        title: "你快勒馬",
                        content:
                          "有一天張飛和關羽快樂的在草地上騎馬，關羽卻不知道他前方是懸崖\n\n張飛就對關羽大叫 : 「你快勒馬 ! 」\n\n關羽回頭就對張飛說 : 「我很快樂 ! 」\n\n於是關羽就掉下崖了....",
                        score: 4,
                      },
                      {
                        user_id: 1038,
                        article_id: 2022,
                        _id: 2022,
                        title: "有点年紀的笑話",
                        content:
                          "有一天瞎子跟瘸子相約去騎車，\n\n瞎子騎車瘸子看路，騎到一半瘸子突然看到前面有個大深溝，\n\n他就對瞎子大喊：溝溝溝，\n\n瞎子回他：啊勒啊勒啊勒，\n\n然後兩人一起掉入深溝中....",
                        score: 3,
                      },
                      {
                        user_id: 1040,
                        article_id: 2029,
                        _id: 2029,
                        title: "不要自稱筆者",
                        content:
                          "有一日上國文課\n老師說：「以後上網發言不要再隨便自稱“筆者”因為現在根本沒人用筆寫字。」\n學生反問：「那要怎麼稱呼?」\n老師說：「鍵人。」\n學生接著問：「那用滑鼠的人呢?」\n老師說：「叫鼠輩。」\n學生又問：「那智慧型手機都用觸控式的，又沒鍵盤、沒滑鼠、又該怎麼稱呼？」\n老師說：「叫觸生。」",
                        score: null,
                      },
                    ],
                  },
                },
              },
            },
          },
          400: {
            description: "can not find user 錯誤詳細描述none",
          },
        },
      },
    },
    "/api/user/article/{article_id}": {
      post: {
        tags: ["User"],
        summary: "儲存文章",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "article_id",
            in: "path",
            required: true,
            description: "文章ID",
          },
        ],
        produces: ["application/json"],
        responses: {
          201: {
            description: "儲存成功",
            content: {
              "application/json": {
                example: {
                  message: "saved article success",
                  data: {
                    _id: 1035,
                    username: "魯肉飯",
                    save: [
                      {
                        _id: 2000,
                        title: "開始囉",
                      },
                    ],
                  },
                },
              },
            },
          },
          400: {
            description: "can not find article 錯誤詳細描述none",
          },
        },
      },
      delete: {
        tags: ["User"],
        summary: "移除已存文章",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "article_id",
            in: "path",
            required: true,
            description: "文章ID",
          },
        ],
        produces: ["application/json"],
        responses: {
          204: {
            description: "移除成功",
          },
          400: {
            description: "the article is not in saved 錯誤詳細描述none",
          },
        },
      },
    },
    "/api/user/follow": {
      get: {
        tags: ["User"],
        summary: "取得已追蹤作者",
        security: [
          {
            bearerAuth: [],
          },
        ],
        produces: ["application/json"],
        responses: {
          200: {
            description: "渲染己追蹤頁時用",
            content: {
              "application/json": {
                example: {
                  message: "get follow success",
                  data: {
                    _id: 1036,
                    username: "鳴人",
                    follow: [
                      {
                        _id: "64cca0ed5c526a96025d8f0c",
                        user_id: 1036,
                        follower_id: 1035,
                        follow_name: "魯肉飯",
                      },
                      {
                        _id: "64cca15c5c526a96025d8f24",
                        user_id: 1036,
                        follower_id: 1037,
                        follow_name: "佐助",
                      },
                    ],
                  },
                },
              },
            },
          },
          400: {
            description: "can not find user 錯誤詳細描述none",
          },
        },
      },
    },
    "/api/user/follow/{user_id}": {
      post: {
        tags: ["User"],
        summary: "追蹤",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "user_id",
            in: "path",
            required: true,
            description: "欲追蹤的會員ID，非使用者本身的ID",
          },
        ],
        produces: ["application/json"],
        responses: {
          201: {
            description: "追蹤成功",
            content: {
              "application/json": {
                example: {
                  message: "follow success",
                  data: {
                    _id: 1035,
                    username: "魯肉飯",
                    follow: {
                      user_id: 1035,
                      follower_id: 1000,
                      follow_name: "測試者1號",
                      _id: "64b6459b8053bf58c1ac55d6",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "can not find follower 錯誤詳細描述none",
          },
        },
      },
      delete: {
        tags: ["User"],
        summary: "移除追蹤",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "user_id",
            in: "path",
            required: true,
            description: "欲追蹤的會員ID，非使用者本身的ID",
          },
        ],
        produces: ["application/json"],
        responses: {
          204: {
            description: "移除成功",
          },
          400: {
            description: "you did not follow the user 錯誤詳細描述none",
          },
        },
      },
    },
    "/api/login": {
      post: {
        tags: ["Auth"],
        summary: "登入",
        requestBody: {
          description: 'mail 可用"naruto@mail.com"，password 可用"123456"',
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  mail: {
                    type: "string",
                  },
                  password: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        produces: ["application/json"],
        responses: {
          200: {
            description: "登入成功，請copy token",
            content: {
              "application/json": {
                example: {
                  message: "login success",
                  data: {
                    token:
                      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjEwMzUsInVzZXJuYW1lIjoi6a2v6IKJ6aOvIiwiaWF0IjoxNjg5NTgwMjg0LCJleHAiOjE2OTAxODUwODR9.DSZaXIfxH1j5mlZTF2bX05v81_FS6prkJfQMTP4a3mo",
                    userData: {
                      _id: 1035,
                      username: "魯肉飯",
                    },
                  },
                },
              },
            },
          },
          400: {
            description:
              "This mail has not been registered yet, please register 錯誤詳細描述none",
          },
        },
      },
    },
    "/api/password": {
      post: {
        tags: ["Auth"],
        summary: "忘記密碼",
        requestBody: {
          description: "請用真實的信箱，不然會收不到信",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  mail: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        produces: ["application/json"],
        responses: {
          201: {
            description: "寄信成功，要到註冊的信箱中，拿取密碼登入",
            content: {
              "application/json": {
                example: {
                  message: "send mail success",
                  data: "admin@mail.com",
                },
              },
            },
          },
          400: {
            description:
              '"mail" is required 錯誤詳細描述ValidationError: "mail" is required',
          },
        },
      },
    },
    "/api/article": {
      get: {
        tags: ["Article"],
        summary: "隨機取得一篇文章",
        produces: ["application/json"],
        responses: {
          200: {
            description: "渲染首頁時用",
            content: {
              "application/json": {
                example: {
                  message: "get random article success",
                  data: {
                    _id: 2009,
                    title: "補課",
                    user_id: [
                      {
                        _id: 1035,
                        username: "魯肉飯",
                      },
                    ],
                    content:
                      "老師﹕「這作業是你自己作的嗎？」\n學生﹕「不，爸爸幫我作的。」\n老師﹕「回去跟你爸爸說，星期天他也要來補課。」",
                    score: null,
                    comment: [],
                  },
                },
              },
            },
          },
          400: {
            description: "there is no article in this station 錯誤詳細描述none",
          },
        },
      },
      post: {
        tags: ["Article"],
        summary: "新増文章",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          description: "標題與内容都必填",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                  },
                  article: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        produces: ["application/json"],
        responses: {
          201: {
            description: "新増文章成功",
            content: {
              "application/json": {
                example: {
                  message: "create article success",
                  data: {
                    article_id: 2009,
                    title: "補課",
                    article:
                      "老師﹕「這作業是你自己作的嗎？」\n學生﹕「不，爸爸幫我作的。」\n老師﹕「回去跟你爸爸說，星期天他也要來補課。」",
                  },
                },
              },
            },
          },
          400: {
            description:
              '"title" is required 錯誤詳細描述ValidationError: "title" is required',
          },
        },
      },
    },
    "/api/article/{article_id}": {
      delete: {
        tags: ["Article"],
        summary: "刪除文章",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "article_id",
            in: "path",
            required: true,
            description: "文章ID",
          },
        ],
        produces: ["application/json"],
        responses: {
          204: {
            description: "刪除成功",
          },
          400: {
            description:
              "You do not have permission to delete 錯誤詳細描述none",
          },
        },
      },
    },
    "/api/article/{user_id}": {
      get: {
        tags: ["Article"],
        summary: "取得該作者的所有文章",
        parameters: [
          {
            name: "user_id",
            in: "path",
            required: true,
            description: "會員ID",
          },
        ],
        produces: ["application/json"],
        responses: {
          200: {
            description: "渲染作者頁時用",
            content: {
              "application/json": {
                example: {
                  message: "get user article success",
                  data: {
                    _id: 1035,
                    username: "魯肉飯",
                    about_me: "null",
                    article: [
                      {
                        _id: 2009,
                        title: "補課",
                        user_id: 1035,
                        content:
                          "老師﹕「這作業是你自己作的嗎？」\n學生﹕「不，爸爸幫我作的。」\n老師﹕「回去跟你爸爸說，星期天他也要來補課。」",
                        score: null,
                      },
                    ],
                  },
                },
              },
            },
          },
          400: {
            description: "can not find user 錯誤詳細描述none",
          },
        },
      },
    },
    "/api/article/one/{article_id}": {
      get: {
        tags: ["Article"],
        summary: "取得指定的單一文章",
        parameters: [
          {
            name: "article_id",
            in: "path",
            required: true,
            description: "文章ID",
          },
        ],
        produces: ["application/json"],
        responses: {
          200: {
            description: "文章頁時用",
            content: {
              "application/json": {
                example: {
                  message: "get one article success",
                  data: {
                    title: "補課",
                    content:
                      "老師﹕「這作業是你自己作的嗎？」\n學生﹕「不，爸爸幫我作的。」\n老師﹕「回去跟你爸爸說，星期天他也要來補課。」",
                    username: "魯肉飯",
                    user_id: 1035,
                    score: null,
                    article_id: "2009",
                    comment: [],
                  },
                },
              },
            },
          },
          400: {
            description: "can't find article 錯誤詳細描述none",
          },
        },
      },
    },
    "/api/article/score/{article_id}": {
      post: {
        tags: ["Article"],
        summary: "評分",
        parameters: [
          {
            name: "article_id",
            in: "path",
            required: true,
            description: "文章ID",
          },
        ],
        requestBody: {
          description: "1~5分，請評一個整數數字",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                  },
                },
              },
            },
          },
        },
        produces: ["application/json"],
        responses: {
          201: {
            description: "評分成功",
            content: {
              "application/json": {
                example: {
                  message: "score success",
                  data: 3,
                },
              },
            },
          },
          400: {
            description:
              '"score" must be less than or equal to 5 錯誤詳細描述ValidationError: "score" must be less than or equal to 5',
          },
        },
      },
    },
    "/api/article/comment/{article_id}": {
      post: {
        tags: ["Article"],
        summary: "留言",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "article_id",
            in: "path",
            required: true,
            description: "文章ID",
          },
        ],
        requestBody: {
          description: "留言",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        produces: ["application/json"],
        responses: {
          201: {
            description: "留言成功",
            content: {
              "application/json": {
                example: {
                  message: "leave message success",
                  data: {
                    article_id: 2000,
                    comment: [
                      {
                        user_id: 1035,
                        username: "魯肉飯",
                        content: "哈哈",
                        _id: "64b63f9ca024ca4cb466c3f0",
                      },
                    ],
                    _id: "64b63f9ca024ca4cb466c3ef",
                  },
                },
              },
            },
          },
          400: {
            description: "can not find article 錯誤詳細描述none",
          },
        },
      },
    },
  },
};

module.exports = apiDoc;
