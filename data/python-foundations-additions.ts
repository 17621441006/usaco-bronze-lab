import type {CourseLesson} from './course-lessons';

// Original USACO-oriented teaching content; no runtime dependency on the catalog.
export const addedPythonLessons:CourseLesson[] = [
  {
    "id": "types",
    "title": "数据类型与变量",
    "label": "Python 基础",
    "minutes": 20,
    "desc": "区分数量、文字、真假与容器，先选对数据的表示方法。",
    "code": "milk = 6\nname = \"Bessie\"\nready = milk > 0\nposition = (2, 3)\nmilk = milk + 2\nprint(milk)\nprint(name, ready)\nprint(position[0], position[1])",
    "steps": [],
    "notes": [
      "int 存整数，float 存近似小数，bool 只有 True / False，str 存文字。例如 6 + 2 得到 8，\"6\" + \"2\" 得到 \"62\"。",
      "变量名保存对一个对象的引用。先写 milk = 6，再写 milk = milk + 2，milk 就指向整数 8；= 不是数学里的恒等式。",
      "list 有序且可修改，tuple 有序但不能替换其中的位置，set 用于去重，dict 保存键与值。例如 [2,2,3] 有 3 项，{2,2,3} 有 2 项。空集合写 set()；{} 是空字典。",
      "None 表示“暂时没有值”，与 0、空字符串都不同；检查是否为 None 写 x is None。可以用 type(x) 帮助理解类型，正式答题通常不用打印类型。",
      "整数计数优先用 int。float 可能有舍入误差，例如 0.1 + 0.2 不精确等于 0.3；不要为了存整数主动转成 float。"
    ],
    "frames": [
      {
        "label": "同样的外观，不同的类型",
        "value": "6 是整数，\"6\" 是文字",
        "explanation": "读题时先想：这个数据要计算数量，还是保留标签？",
        "items": [
          {
            "label": "int · milk",
            "value": "6",
            "active": true
          },
          {
            "label": "str · tag",
            "value": "\"6\"",
            "active": true
          },
          {
            "label": "float · weight",
            "value": "2.5",
            "active": false
          },
          {
            "label": "bool · ready",
            "value": "True",
            "active": false
          }
        ]
      },
      {
        "label": "执行运算",
        "value": "6 + 2 = 8；\"6\" + \"2\" = \"62\"",
        "explanation": "整数相加，字符串拼接；\"6\" + 2 会报 TypeError。",
        "items": [
          {
            "label": "整数相加",
            "value": "8",
            "active": true
          },
          {
            "label": "文字拼接",
            "value": "\"62\"",
            "active": true
          },
          {
            "label": "布尔判断 6 > 0",
            "value": "True",
            "active": false
          }
        ]
      },
      {
        "label": "保存一组数据",
        "value": "顺序、重复、键值决定容器",
        "explanation": "列表保留两次 2；集合只保留不同值；字典将名字关联到奶量。",
        "items": [
          {
            "label": "list",
            "value": "[2, 2, 3]",
            "active": false
          },
          {
            "label": "tuple",
            "value": "(2, 3)",
            "active": false
          },
          {
            "label": "set",
            "value": "{2, 3}",
            "active": true
          },
          {
            "label": "dict",
            "value": "Bessie → 6",
            "active": false
          }
        ]
      },
      {
        "label": "更新变量",
        "value": "milk = 8，暂缺答案 = None",
        "explanation": "把 milk 加 2 后重新赋值；没有答案时不要用 0 冒充“未找到”。",
        "items": [
          {
            "label": "原来的整数",
            "value": "6",
            "active": false
          },
          {
            "label": "milk 现在指向",
            "value": "8",
            "active": true
          },
          {
            "label": "未找到的答案",
            "value": "None",
            "active": true
          }
        ]
      }
    ]
  },
  {
    "id": "conversion",
    "title": "类型转换与真假值",
    "label": "Python 基础",
    "minutes": 20,
    "desc": "把输入文字变成可计算的数据，并理解数字、字符串和布尔值的区别。",
    "code": "text = \"007\"\nnumber = int(text)\nprint(number + 1)\nprint(str(number))\nprint(bool(\"0\"), bool(0))\nprint(int(-2.9))",
    "steps": [],
    "notes": [
      "input() 返回 str。int(\"007\") 是 7，float(\"2.5\") 是 2.5，str(7) 是 \"7\"；转换不会改变原来的 text。",
      "int(2.9) 得到 2，int(-2.9) 得到 -2，都是朝 0 截断；这与负数的 // 向下取整不同。int(\"2.9\") 会报错，需要先确认题目究竟要求整数还是小数。",
      "bool(0)、bool(0.0)、bool(\"\")、bool([])、bool(None) 为 False；非空字符串 bool(\"0\") 和 bool(\"False\") 都是 True。判断文本数字是否为 0，应先 int(text)。",
      "print(6) 合法，会输出文本 6 和换行；竞赛评测比较输出内容，不会因为传给 print 的值是 int 就判错。sys.stdout.write() 则要求字符串。",
      "题目要求两位小数时可写 print(f\"{value:.2f}\")；只有题意允许小数误差时才使用 float，整数答案不要输出多余的 .0。"
    ],
    "frames": [
      {
        "label": "读到文本",
        "value": "text = \"007\"",
        "explanation": "输入的前导零仍保存在原字符串里。",
        "items": [
          {
            "label": "原文本",
            "value": "\"007\"",
            "active": true
          },
          {
            "label": "类型",
            "value": "str",
            "active": false
          }
        ]
      },
      {
        "label": "转为整数",
        "value": "number = int(text) → 7",
        "explanation": "转换后的整数可以相加；text 仍然是 \"007\"。",
        "items": [
          {
            "label": "text",
            "value": "\"007\"",
            "active": false
          },
          {
            "label": "number",
            "value": "7",
            "active": true
          },
          {
            "label": "number + 1",
            "value": "8",
            "active": true
          }
        ]
      },
      {
        "label": "转换真假",
        "value": "bool(\"0\") → True；bool(0) → False",
        "explanation": "非空字符串看的是是否为空，不是字符串里的数字是多少。",
        "items": [
          {
            "label": "非空字符串 \"0\"",
            "value": "True",
            "active": true
          },
          {
            "label": "整数 0",
            "value": "False",
            "active": true
          },
          {
            "label": "空字符串 \"\"",
            "value": "False",
            "active": false
          }
        ]
      },
      {
        "label": "输出与截断",
        "value": "str(7) → \"7\"；int(-2.9) → -2",
        "explanation": "print 会把参数转为文本；int 对小数丢弃小数部分。",
        "items": [
          {
            "label": "print(7)",
            "value": "7",
            "active": false
          },
          {
            "label": "print(str(7))",
            "value": "7",
            "active": false
          },
          {
            "label": "int(-2.9)",
            "value": "-2",
            "active": true
          },
          {
            "label": "-29 // 10",
            "value": "-3",
            "active": false
          }
        ]
      }
    ]
  },
  {
    "id": "builtins",
    "title": "常用内置函数",
    "label": "Python 基础",
    "minutes": 22,
    "desc": "用 abs、len、sum、min、max 直接表达距离、数量、总量与最值。",
    "code": "milk = [4, 0, 7, 4]\nprint(len(milk), sum(milk))\nprint(min(milk), max(milk))\nprint(abs(milk[0] - milk[-1]))\nprint(milk.count(4))",
    "steps": [],
    "notes": [
      "abs(a-b) 是数轴上两点的距离。abs(-7)=7，abs(0)=0；二维曼哈顿距离是 abs(x1-x2)+abs(y1-y2)。",
      "len(a) 数元素个数，sum(a) 加数值；[4,0,7,4] 的长度是 4，总和是 15。sum([])=0，len([])=0。",
      "min(a)、max(a) 求非空序列的最小值和最大值，也可写 min(x,y) 或 max(x,y)。空序列要先判断，或明确写 max(a, default=0)；全负数时不要随手把最大值初始设为 0。",
      "count 不是全局内置函数。列表写 a.count(x)，字符串写 s.count(sub)；a.count(4) 数列表里等于 4 的项。找不到时返回 0。",
      "不要写 sum = 0、list = []、max = 5 来当普通变量名，它们会遮住同名内置函数。一次 count 会扫描序列；需要大量重复查询时，用字典预先计数。"
    ],
    "frames": [
      {
        "label": "四天记录",
        "value": "milk = [4, 0, 7, 4]",
        "explanation": "每张卡片是一条记录，0 也是一个合法元素。",
        "items": [
          {
            "label": "第 1 天",
            "value": "4",
            "active": false
          },
          {
            "label": "第 2 天",
            "value": "0",
            "active": true
          },
          {
            "label": "第 3 天",
            "value": "7",
            "active": false
          },
          {
            "label": "第 4 天",
            "value": "4",
            "active": false
          }
        ]
      },
      {
        "label": "数量与总量",
        "value": "len = 4；sum = 15",
        "explanation": "数卡片数量与累计卡片里的数，是两种不同操作。",
        "items": [
          {
            "label": "记录数",
            "value": "4",
            "active": true
          },
          {
            "label": "4 + 0 + 7 + 4",
            "value": "15",
            "active": true
          }
        ]
      },
      {
        "label": "最值与距离",
        "value": "min = 0；max = 7；abs(4-4) = 0",
        "explanation": "最值来自数据本身；两端相同则距离为 0。",
        "items": [
          {
            "label": "最小值",
            "value": "0",
            "active": true
          },
          {
            "label": "最大值",
            "value": "7",
            "active": true
          },
          {
            "label": "首尾差的绝对值",
            "value": "0",
            "active": false
          }
        ]
      },
      {
        "label": "数指定值",
        "value": "milk.count(4) = 2",
        "explanation": "调用的是这个列表的方法，写 count(milk, 4) 不成立。",
        "items": [
          {
            "label": "第 1 天",
            "value": "4 ✓",
            "active": true
          },
          {
            "label": "第 2 天",
            "value": "0",
            "active": false
          },
          {
            "label": "第 3 天",
            "value": "7",
            "active": false
          },
          {
            "label": "第 4 天",
            "value": "4 ✓",
            "active": true
          }
        ]
      }
    ]
  },
  {
    "id": "list-methods",
    "title": "列表增删、查找与复制",
    "label": "Python 基础",
    "minutes": 24,
    "desc": "维护变化的草料清单，区分修改原列表与制作独立副本。",
    "code": "a = [2, 4, 2]\na.append(7)\na.extend([1, 3])\nlast = a.pop()\na.remove(2)\nprint(last)\nprint(a.index(2), a.count(2))\nb = a[:]\nb[0] = 9\nprint(*a)\nprint(*b)",
    "steps": [],
    "notes": [
      "append(x) 在末尾添加一个元素；extend([x,y]) 依次添加两个。append([1,3]) 添加的是一个子列表，与 extend([1,3]) 不同。",
      "pop() 删除并返回最后一项，pop(i) 删除指定下标；空列表 pop() 会报 IndexError。remove(x) 删除第一个等于 x 的值，不存在会报 ValueError。",
      "index(x) 返回第一次出现的下标，找不到会报 ValueError；count(x) 返回次数，找不到为 0。使用 index/remove 前可用 x in a 检查。",
      "b = a 只是另一个名字指向同一列表；b = a[:] 或 a.copy() 才复制外层列表。嵌套列表中的子列表仍可能共享，二维独立行在后续课专门练习。",
      "append、extend、remove、sort 都直接修改列表，通常返回 None；不要写 a = a.append(x)。反复删除或在中间插入会移动后续元素，频繁队首操作可选 deque。"
    ],
    "frames": [
      {
        "label": "初始清单",
        "value": "a = [2, 4, 2]",
        "explanation": "相同数值可出现多次，下标仍然不同。",
        "items": [
          {
            "label": "0",
            "value": "2",
            "active": false
          },
          {
            "label": "1",
            "value": "4",
            "active": false
          },
          {
            "label": "2",
            "value": "2",
            "active": false
          }
        ]
      },
      {
        "label": "增加三项",
        "value": "append(7)，extend([1,3])",
        "explanation": "先加一个 7，再分别加 1 和 3。",
        "items": [
          {
            "label": "0",
            "value": "2",
            "active": false
          },
          {
            "label": "1",
            "value": "4",
            "active": false
          },
          {
            "label": "2",
            "value": "2",
            "active": false
          },
          {
            "label": "3",
            "value": "7",
            "active": true
          },
          {
            "label": "4",
            "value": "1",
            "active": true
          },
          {
            "label": "5",
            "value": "3",
            "active": true
          }
        ]
      },
      {
        "label": "删除并查询",
        "value": "pop() → 3；remove(2) 删掉第一个 2",
        "explanation": "列表变成 [4,2,7,1]；此时 index(2)=1，count(2)=1。",
        "items": [
          {
            "label": "0",
            "value": "4",
            "active": false
          },
          {
            "label": "1",
            "value": "2",
            "active": true
          },
          {
            "label": "2",
            "value": "7",
            "active": false
          },
          {
            "label": "3",
            "value": "1",
            "active": false
          },
          {
            "label": "取出的末项",
            "value": "3",
            "active": true
          }
        ]
      },
      {
        "label": "独立副本",
        "value": "b = a[:]；b[0] = 9",
        "explanation": "修改 b 的整数元素后，a[0] 仍然是 4。",
        "items": [
          {
            "label": "a",
            "value": "[4, 2, 7, 1]",
            "active": false
          },
          {
            "label": "b",
            "value": "[9, 2, 7, 1]",
            "active": true
          },
          {
            "label": "若写 b = a",
            "value": "两者会一起变化",
            "active": false
          }
        ]
      }
    ]
  },
  {
    "id": "string-methods",
    "title": "字符串的常用方法",
    "label": "Python 基础",
    "minutes": 22,
    "desc": "清理输入、拆分与组合名单，查找子串并分清重叠计数。",
    "code": "text = \"  Bessie   Elsie  \"\nnames = text.strip().split()\nprint(\"-\".join(names))\ns = \"AAAAA\"\nprint(s.find(\"AA\"), s.count(\"AA\"))\nprint(s.replace(\"AA\", \"B\"))",
    "steps": [],
    "notes": [
      "strip() 去掉两端空白，不删除中间空白；不带参数的 split() 按连续空白切分，并忽略两端空白。\"  Bessie   Elsie  \".split() 得到两个名字。",
      "\" \".join(parts) 用空格连接字符串列表；数字列表先 map(str,a)。例如 \"-\".join([\"Bessie\",\"Elsie\"]) 是 \"Bessie-Elsie\"。",
      "find(sub) 返回首次出现的起始下标，不存在为 -1；检查是否出现可直接用 sub in s。不要把 find 的返回值直接当布尔值，因为位置 0 会被当成 False。",
      "replace(old,new) 返回新字符串，原 s 不变。字符串不能写 s[0] = \"M\"；需要转换为列表修改后再 join，或组合切片。",
      "str.count(sub) 统计不重叠匹配：\"AAAAA\".count(\"AA\")=2；如果题目要求允许重叠，则逐个检查起点，共有 4 处。本课子串保证非空；空子串的 count 是 len(s)+1。"
    ],
    "frames": [
      {
        "label": "原始输入",
        "value": "\"  Bessie   Elsie  \"",
        "explanation": "两端空白和名字之间的连续空白需要分别理解。",
        "items": [
          {
            "label": "首部",
            "value": "2 个空格",
            "active": false
          },
          {
            "label": "名字 1",
            "value": "Bessie",
            "active": false
          },
          {
            "label": "间隔",
            "value": "3 个空格",
            "active": false
          },
          {
            "label": "名字 2",
            "value": "Elsie",
            "active": false
          }
        ]
      },
      {
        "label": "拆分再组合",
        "value": "split() → [\"Bessie\", \"Elsie\"]",
        "explanation": "用 join 选择最终的分隔符，得到 Bessie-Elsie。",
        "items": [
          {
            "label": "parts[0]",
            "value": "Bessie",
            "active": true
          },
          {
            "label": "parts[1]",
            "value": "Elsie",
            "active": true
          },
          {
            "label": "\"-\".join(parts)",
            "value": "Bessie-Elsie",
            "active": false
          }
        ]
      },
      {
        "label": "非重叠计数",
        "value": "AAAAA 中的 AA：起点 0、2",
        "explanation": "第一处占用 0、1，第二处占用 2、3；最后一个 A 不够组成 AA。",
        "items": [
          {
            "label": "0–1",
            "value": "AA ✓",
            "active": true
          },
          {
            "label": "2–3",
            "value": "AA ✓",
            "active": true
          },
          {
            "label": "4",
            "value": "A",
            "active": false
          },
          {
            "label": "count / find",
            "value": "2 / 0",
            "active": false
          }
        ]
      },
      {
        "label": "生成新字符串",
        "value": "replace(\"AA\", \"B\") → \"BBA\"",
        "explanation": "替换同样使用不重叠匹配，原来的 s 仍然是 AAAAA。",
        "items": [
          {
            "label": "原 s",
            "value": "AAAAA",
            "active": false
          },
          {
            "label": "替换结果",
            "value": "BBA",
            "active": true
          },
          {
            "label": "允许重叠时的数量",
            "value": "4",
            "active": false
          }
        ]
      }
    ]
  },
  {
    "id": "tuples-grid",
    "title": "元组、解包与二维列表",
    "label": "Python 基础",
    "minutes": 24,
    "desc": "用坐标对表示位置，用独立的多行列表表示农场网格。",
    "code": "position = (0, 1)\nr, c = position\ngrid = [[0] * 3 for _ in range(2)]\ngrid[r][c] = 5\nfor row in grid:\n    print(*row)",
    "steps": [],
    "notes": [
      "point=(2,3) 保存一对坐标，x,y=point 将两个值分别解包。x,y=y,x 可以交换变量；元组不能写 point[0]=4。单元素元组必须写 (4,)。",
      "二维列表通常写 grid[row][col]，先行后列；r 行 c 列的下标范围分别是 0..r-1、0..c-1。题目若从 1 开始编号，读入后再统一减 1。",
      "独立行用 [[0]*c for _ in range(r)]。不要写 [[0]*c]*r：它重复引用同一行，改 grid[0][1] 可能让每一行的第 1 列都变化。",
      "二维读入可写 [list(map(int,input().split())) for _ in range(r)]；逐行输出写 for row in grid: print(*row)。",
      "复制二维整数表可写 [row[:] for row in grid]；单独 grid[:] 只复制外层。检查边界格时，1 行或 1 列的格子不能按四条边重复累计。"
    ],
    "frames": [
      {
        "label": "坐标是一对值",
        "value": "position = (0, 1)",
        "explanation": "解包后 r=0，c=1，目标是第 0 行第 1 列。",
        "items": [
          {
            "label": "r · 行",
            "value": "0",
            "active": true
          },
          {
            "label": "c · 列",
            "value": "1",
            "active": true
          }
        ]
      },
      {
        "label": "建立独立行",
        "value": "grid = [[0]*3 for _ in range(2)]",
        "explanation": "循环每次创建一条新行，两条行的数据互相独立。",
        "items": [
          {
            "label": "第 0 行",
            "value": "[0, 0, 0]",
            "active": false
          },
          {
            "label": "第 1 行",
            "value": "[0, 0, 0]",
            "active": false
          }
        ]
      },
      {
        "label": "只更新目标格",
        "value": "grid[0][1] = 5",
        "explanation": "第 0 行的中间格变成 5；第 1 行保持不变。",
        "items": [
          {
            "label": "第 0 行",
            "value": "[0, 5, 0]",
            "active": true
          },
          {
            "label": "第 1 行",
            "value": "[0, 0, 0]",
            "active": false
          },
          {
            "label": "目标坐标",
            "value": "(0, 1)",
            "active": false
          }
        ]
      },
      {
        "label": "按行输出",
        "value": "0 5 0 / 0 0 0",
        "explanation": "每行元素之间用空格，两行之间换行。",
        "items": [
          {
            "label": "输出第 1 行",
            "value": "0 5 0",
            "active": true
          },
          {
            "label": "输出第 2 行",
            "value": "0 0 0",
            "active": true
          },
          {
            "label": "总和",
            "value": "5",
            "active": false
          }
        ]
      }
    ]
  },
  {
    "id": "iteration",
    "title": "遍历、推导式与配对",
    "label": "Python 基础",
    "minutes": 25,
    "desc": "用 enumerate 保留编号，用 zip 对齐记录，再筛选需要的项。",
    "code": "before = [4, 2, 7]\nafter = [5, 2, 3]\nchanges = [y - x for x, y in zip(before, after)]\nfor i, change in enumerate(changes, 1):\n    print(i, change)\nprint(any(x < 0 for x in changes))\nprint(all(x >= 0 for x in changes))",
    "steps": [],
    "notes": [
      "enumerate(a) 同时给出下标和值，默认编号从 0 开始；enumerate(a,1) 从 1 开始，适合题目中的牛号。不要把这种编号直接当成原列表下标。",
      "zip(a,b) 逐项配对，默认在较短序列耗尽时停止。比赛题若要求 n 对，要保证两份输入都读足 n 项，不应靠 zip 静默忽略缺项。",
      "[x*x for x in a if x>0] 依次筛选正数并平方；读不顺时先写普通 for 循环，推导式只是简写，不会改变算法复杂度。",
      "any(checks) 表示至少一项成立，all(checks) 表示全部成立；any([])=False，all([])=True。它们遇到已能决定答案的项时会停止。",
      "zip、enumerate、map 的结果可以被迭代消费；需要再次使用结果时保存为列表。iter()/next() 的逐项读入在后续输入课演示。"
    ],
    "frames": [
      {
        "label": "两份对应记录",
        "value": "before=[4,2,7]，after=[5,2,3]",
        "explanation": "第 i 项始终是同一头牛的数据。",
        "items": [
          {
            "label": "1 号",
            "value": "4 → 5",
            "active": false
          },
          {
            "label": "2 号",
            "value": "2 → 2",
            "active": false
          },
          {
            "label": "3 号",
            "value": "7 → 3",
            "active": false
          }
        ]
      },
      {
        "label": "逐项配对",
        "value": "zip → (4,5)、(2,2)、(7,3)",
        "explanation": "每对计算后值减前值，得到变化量。",
        "items": [
          {
            "label": "第 1 对",
            "value": "5 − 4 = 1",
            "active": true
          },
          {
            "label": "第 2 对",
            "value": "2 − 2 = 0",
            "active": true
          },
          {
            "label": "第 3 对",
            "value": "3 − 7 = -4",
            "active": true
          }
        ]
      },
      {
        "label": "保留题目编号",
        "value": "enumerate(changes,1)",
        "explanation": "编号从 1 开始；数值仍按原顺序排列。",
        "items": [
          {
            "label": "编号 1",
            "value": "+1",
            "active": false
          },
          {
            "label": "编号 2",
            "value": "0",
            "active": false
          },
          {
            "label": "编号 3",
            "value": "-4",
            "active": true
          }
        ]
      },
      {
        "label": "汇总条件",
        "value": "有下降？True；全部不下降？False",
        "explanation": "一头下降就足以使 any(x<0) 成立、all(x>=0) 不成立。",
        "items": [
          {
            "label": "1 >= 0",
            "value": "True",
            "active": false
          },
          {
            "label": "0 >= 0",
            "value": "True",
            "active": false
          },
          {
            "label": "-4 >= 0",
            "value": "False",
            "active": true
          },
          {
            "label": "any / all",
            "value": "True / False",
            "active": false
          }
        ]
      }
    ]
  },
  {
    "id": "sorting-python",
    "title": "排序函数与排序规则",
    "label": "Python 基础",
    "minutes": 24,
    "desc": "区分生成新列表和原地排序，用 key 表达排名与并列规则。",
    "code": "cows = [(5, \"Bessie\"), (8, \"Elsie\"), (5, \"Alice\")]\nranked = sorted(cows, key=lambda cow: -cow[0])\nfor milk, name in ranked:\n    print(name, milk)\nprint(cows == ranked)",
    "steps": [],
    "notes": [
      "sorted(a) 返回新列表，不改变 a；a.sort() 在原列表上排序并返回 None。不要写 a = a.sort()。默认升序，reverse=True 表示降序。",
      "key 是为每个元素计算比较依据的小函数。按距离排序可写 sorted(a,key=abs)，按产奶量可写 key=lambda cow: cow[0]。lambda 参数:表达式 是单表达式函数。",
      "多个排序条件可以写成元组。例如 key=lambda cow: (-cow[0],cow[1]) 表示奶量降序，同量按名字升序；元组从左到右比较第一个不同的位置。",
      "排序稳定：key 相同的记录保持输入先后。例如按奶量降序后，原来靠前的 Bessie 仍在同奶量的 Alice 前。若题目要求按名字打破并列，就要明确加入名字作为第二条件。",
      "reversed(a) 只反转原顺序，并不排序；list(reversed([4,1,3])) 是 [3,1,4]。若需要原下标，可先保存 (值,下标) 再排序。"
    ],
    "frames": [
      {
        "label": "输入顺序",
        "value": "Bessie 5，Elsie 8，Alice 5",
        "explanation": "奶量相同的两头牛也有不同身份。",
        "items": [
          {
            "label": "0 · Bessie",
            "value": "5",
            "active": false
          },
          {
            "label": "1 · Elsie",
            "value": "8",
            "active": true
          },
          {
            "label": "2 · Alice",
            "value": "5",
            "active": false
          }
        ]
      },
      {
        "label": "计算排序键",
        "value": "key = -milk",
        "explanation": "升序比较 -8、-5、-5，让奶量 8 排到前面。",
        "items": [
          {
            "label": "Bessie 的 key",
            "value": "-5",
            "active": false
          },
          {
            "label": "Elsie 的 key",
            "value": "-8",
            "active": true
          },
          {
            "label": "Alice 的 key",
            "value": "-5",
            "active": false
          }
        ]
      },
      {
        "label": "稳定排列",
        "value": "Elsie → Bessie → Alice",
        "explanation": "两个 -5 相同，Bessie 和 Alice 保持原来的先后。",
        "items": [
          {
            "label": "第 1 名 · Elsie",
            "value": "8",
            "active": true
          },
          {
            "label": "第 2 名 · Bessie",
            "value": "5",
            "active": false
          },
          {
            "label": "第 3 名 · Alice",
            "value": "5",
            "active": false
          }
        ]
      },
      {
        "label": "保留原列表",
        "value": "cows 不变，ranked 是新列表",
        "explanation": "若将名字加进 key，两个奶量 5 的记录会改成 Alice 在前。",
        "items": [
          {
            "label": "原顺序",
            "value": "Bessie / Elsie / Alice",
            "active": false
          },
          {
            "label": "只按奶量",
            "value": "Elsie / Bessie / Alice",
            "active": true
          },
          {
            "label": "再按名字",
            "value": "Elsie / Alice / Bessie",
            "active": false
          }
        ]
      }
    ]
  },
  {
    "id": "function-basics",
    "title": "函数参数、返回值与作用域",
    "label": "Python 基础",
    "minutes": 24,
    "desc": "把重复的小段计算写成函数，让调用处拿到可以继续计算的结果。",
    "code": "def boxes_needed(amount, capacity):\n    boxes = (amount + capacity - 1) // capacity\n    return boxes\n\nfirst = boxes_needed(17, 5)\nsecond = boxes_needed(8, 5)\nprint(first, second)\nprint(first + second)",
    "steps": [],
    "notes": [
      "def 后写函数名与参数，缩进的代码是函数体。调用 boxes_needed(17,5) 时，amount=17，capacity=5；参数名不必与调用处变量名相同。",
      "return 将结果交给调用者，并立即结束当前这次调用。print 只负责输出；没有 return 的函数默认返回 None，不能把它当成计算结果继续相加。",
      "函数内的 boxes 是本次调用的局部变量，另一轮调用会重新计算。尽量通过参数与返回值传递数据，短题不需要强行使用 global、类或 main()。",
      "这里要求 amount>=0、capacity>0；capacity=0 会除零。若装箱规则变为必须装满，答案应改用 amount//capacity，不能机械套公式。",
      "参数接收列表时会引用同一对象：函数内 a.append(x) 会改变外面的列表；函数内 a=[] 只是重新绑定局部名字。需要保护原数据时先复制。"
    ],
    "frames": [
      {
        "label": "第一次调用",
        "value": "boxes_needed(17,5)",
        "explanation": "参数接收 17 份饲料、每箱容量 5。",
        "items": [
          {
            "label": "amount",
            "value": "17",
            "active": true
          },
          {
            "label": "capacity",
            "value": "5",
            "active": true
          }
        ]
      },
      {
        "label": "计算并返回",
        "value": "(17+5-1)//5 = 4",
        "explanation": "return 4 把结果送回调用位置，first 保存 4。",
        "items": [
          {
            "label": "局部 boxes",
            "value": "4",
            "active": false
          },
          {
            "label": "first",
            "value": "4",
            "active": true
          }
        ]
      },
      {
        "label": "独立的第二次调用",
        "value": "boxes_needed(8,5) → 2",
        "explanation": "新调用中的 amount 是 8，第一轮的结果不受影响。",
        "items": [
          {
            "label": "amount",
            "value": "8",
            "active": true
          },
          {
            "label": "局部 boxes",
            "value": "2",
            "active": true
          },
          {
            "label": "first 仍为",
            "value": "4",
            "active": false
          }
        ]
      },
      {
        "label": "组合结果",
        "value": "first + second = 6",
        "explanation": "两批分别装箱，共用 6 箱。只有返回数值，调用处才能继续相加。",
        "items": [
          {
            "label": "第一批",
            "value": "4",
            "active": false
          },
          {
            "label": "第二批",
            "value": "2",
            "active": false
          },
          {
            "label": "合计输出",
            "value": "6",
            "active": true
          },
          {
            "label": "仅 print 的函数返回",
            "value": "None",
            "active": false
          }
        ]
      }
    ]
  },
  {
    "id": "standard-library",
    "title": "竞赛常用标准库",
    "label": "Python 基础",
    "minutes": 28,
    "desc": "按需认识数学、计数和队列工具；二分与堆作为可选衔接。",
    "code": "from math import gcd, isqrt\n\nprint(gcd(18, 24))\nprint(isqrt(20))",
    "steps": [],
    "notes": [
      "只导入本题实际使用的工具。math.gcd(a,b) 给最大公约数，如 gcd(18,24)=6；math.isqrt(n) 给非负整数平方根向下取整，如 isqrt(20)=4，可避免用浮点数估整型平方根。",
      "from collections import Counter 后，c=Counter([2,2,3]) 得到 2→2 次、3→1 次，c[9] 为 0；它是字典计数的简写，不必每题都用。",
      "deque 是可选队列工具：from collections import deque 后，q=deque([\"Bessie\",\"Elsie\"])，q.append(\"Alice\") 追加队尾，q.popleft() 取出 Bessie。空队列弹出会报错；只有需要队首频繁进出时才值得用。",
      "可选衔接：bisect_left(a,x) 找有序列表中第一个 >=x 的位置，bisect_right 找第一个 >x 的位置。差值能统计 x 的次数；查询前必须保证 a 已按升序排列。",
      "可选衔接：import heapq 后，heapq.heapify(a) 建最小堆，heapq.heappop(a) 取最小值，heapq.heappush(a,x) 插入。堆列表整体并非有序；只有需要反复取最小值时考虑它。这些工具不是铜组每题的必用模板。"
    ],
    "frames": [
      {
        "label": "整数数学",
        "value": "gcd(18,24)=6；isqrt(20)=4",
        "explanation": "18 与 24 可按每包 6 分组；4²<=20<5²。本课示例代码只导入并使用这两个函数。",
        "items": [
          {
            "label": "18 ÷ 6",
            "value": "3 包",
            "active": false
          },
          {
            "label": "24 ÷ 6",
            "value": "4 包",
            "active": false
          },
          {
            "label": "最大整数边长",
            "value": "4",
            "active": true
          }
        ]
      },
      {
        "label": "计数工具",
        "value": "Counter([2,2,3])",
        "explanation": "每遇到一项就在对应键上加一，未出现过的键查询为 0。",
        "items": [
          {
            "label": "键 2",
            "value": "2 次",
            "active": true
          },
          {
            "label": "键 3",
            "value": "1 次",
            "active": false
          },
          {
            "label": "键 9",
            "value": "0 次",
            "active": false
          }
        ]
      },
      {
        "label": "先进先出",
        "value": "Bessie → Elsie → Alice",
        "explanation": "append 把 Alice 放到队尾；popleft 取出最先到达的 Bessie。",
        "items": [
          {
            "label": "本次服务",
            "value": "Bessie",
            "active": true
          },
          {
            "label": "新的队首",
            "value": "Elsie",
            "active": false
          },
          {
            "label": "队尾",
            "value": "Alice",
            "active": false
          }
        ]
      },
      {
        "label": "二分工具 · 选学",
        "value": "a=[1,2,2,5]，查找 2",
        "explanation": "左边界为 1，右边界为 3，次数为 3-1=2；返回的是下标，不是数值。",
        "items": [
          {
            "label": "下标 0",
            "value": "1",
            "active": false
          },
          {
            "label": "左界 1",
            "value": "2",
            "active": true
          },
          {
            "label": "下标 2",
            "value": "2",
            "active": true
          },
          {
            "label": "右界 3",
            "value": "5",
            "active": false
          }
        ]
      },
      {
        "label": "最小堆 · 选学",
        "value": "[5,2,7] 建堆，再放入 1",
        "explanation": "每次只保证堆顶最小；弹出 1 后下一次才是 2，不能把堆当成完整排序结果。",
        "items": [
          {
            "label": "插入的值",
            "value": "1",
            "active": true
          },
          {
            "label": "本次弹出",
            "value": "1",
            "active": true
          },
          {
            "label": "下一堆顶",
            "value": "2",
            "active": false
          },
          {
            "label": "仍在堆中",
            "value": "5、7",
            "active": false
          }
        ]
      }
    ]
  }
];
