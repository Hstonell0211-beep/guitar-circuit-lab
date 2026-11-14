(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const STORAGE_KEY = 'guitar-circuit-lab-measurements-v1';
  const LANGUAGE_KEY = 'guitar-circuit-lab-language-v1';

  const state = {
    // The public build is intentionally English-only. The circuit model and
    // all switch behaviour remain unchanged.
    language: 'en',
    mode: 'parallel',
    enabled: { neck: true, middle: false, bridge: false },
    reversed: { neck: false, middle: false, bridge: false },
    diagramScope: 'active',
    focusedNetwork: null,
    focusedTerminal: null,
    focusedWireIds: null,
    selectedWire: null,
    wireFilter: 'all',
    weldedWires: []
  };

  // The circuit model remains language-neutral. This small phrase table only
  // changes labels and explanations shown to the user.
  const englishPhrases = [
    ['三拾音器矩阵电路实验台', 'Three-Pickup Matrix Circuit Lab'],
    ['七开关电路 · 实验与焊接辅助', 'Seven-Switch Circuit · Testing & Soldering Aid'],
    ['互动模型：正在自检 128 种状态', 'Interactive model: checking 128 states'],
    ['互动模型：128 种状态自检通过', 'Interactive model: all 128 states verified'],
    ['实物脚位：等待万用表确认', 'Physical lugs: multimeter confirmation pending'],
    ['琴颈拾音器', 'Neck Pickup'], ['琴中拾音器', 'Middle Pickup'], ['琴桥拾音器', 'Bridge Pickup'],
    ['琴颈 Phase 开关', 'Neck Phase Switch'], ['琴中 Phase 开关', 'Middle Phase Switch'], ['琴桥 Phase 开关', 'Bridge Phase Switch'],
    ['琴颈启用 / 旁路开关 A', 'Neck Enable / Bypass Switch A'], ['琴中启用 / 旁路开关 B', 'Middle Enable / Bypass Switch B'], ['琴桥启用 / 旁路开关 C', 'Bridge Enable / Bypass Switch C'],
    ['总串联 / 并联开关 D', 'Master Series / Parallel Switch D'],
    ['总音量电位器', 'Master Volume Potentiometer'], ['总音色电位器', 'Master Tone Potentiometer'],
    ['单声道输出插座', 'Mono Output Jack'], ['音色电容', 'Tone Capacitor'],
    ['公共信号地', 'Common Signal Ground'], ['矩阵输出总线', 'Matrix Output Bus'],
    ['外部音箱 / 声卡输入负载', 'External Amp / Audio Interface Load'], ['外部负载', 'External Load'],
    ['运行模拟', 'Simulation'], ['逐触点查看', 'Inspect Contacts'], ['焊接演示', 'Soldering Demo'], ['逐线焊接', 'Wire-by-Wire Soldering'], ['实物确认', 'Physical Checks'],
    ['当前开关组合', 'Current Switch Combination'], ['直接拨动图中开关，观察完整回路', 'Toggle the switches in the diagram to inspect the complete circuit'], ['恢复初始状态', 'Restore Initial State'],
    ['并联', 'Parallel'], ['串联', 'Series'], ['总并联', 'Master Parallel'], ['总串联', 'Master Series'],
    ['输出状态', 'Output Status'], ['正在工作的拾音器', 'Active Pickups'], ['主体矩阵信号路径数量', 'Matrix Signal Paths'], ['当前测试 / 整机模式', 'Current Test / Guitar Mode'],
    ['当前完整回路：从公共地出发并返回公共地', 'Complete circuit: from common ground and back to common ground'],
    ['箭头仅表示检查回路的阅读方向，不表示交流信号永远单向流动', 'Arrows show the reading direction for checking the circuit; audio is not permanently one-way'],
    ['可操作的7开关完整回路图', 'Interactive seven-switch circuit diagram'], ['点击图中开关拨杆即可切换；点击导线或触点可以单独追踪。', 'Toggle a switch lever to change state; click a wire or contact to trace one network.'],
    ['图纸模式', 'Diagram View'], ['固定焊线网络', 'Fixed Wiring Network'], ['当前电流回路', 'Current Signal Path'], ['详细筛选', 'Detailed Filter'], ['退出单线追踪', 'Exit Wire Trace'],
    ['固定焊线全部网络', 'All fixed wiring'], ['只看当前电流回路', 'Current signal path only'], ['完整输出级', 'Complete output stage'], ['当前模式', 'Current Mode'], ['已闭合触点', 'Closed Contacts'], ['回路状态', 'Circuit Status'],
    ['包含三个拾音器、两排六个可拨动小开关、一个可拨动四刀串并联开关、总音量、总音色、电容、单声道输出插座、外部负载和公共信号地。', 'Three pickups, two rows of six-way switches, one four-pole series/parallel switch, master volume, master tone, capacitor, mono output jack, external load, and common signal ground.'],
    ['红色：拾音器输出端至 Tip', 'Red: pickup output side to Tip'], ['蓝色：公共地侧与 Sleeve 返回', 'Blue: common ground side and Sleeve return'], ['拾音器自身颜色：正在工作的线圈', 'Pickup color: active coil'], ['静态箭头：从公共地检查到输出，并经负载返回地；不是直流电流方向', 'Static arrows: check from ground to output and back through the load; not DC current direction'], ['细彩色线：外部固定导线', 'Thin colored line: fixed external wire'], ['深灰线：开关内部闭合', 'Dark gray line: switch contact closed'], ['开关断开的一侧', 'Open side of switch'], ['当前追踪触点', 'Contact currently being traced'],
    ['三个拾音器当前分别发生了什么', 'What is happening to each pickup'], ['开关内部', 'Inside the switches'], ['逐触点导通查看', 'Inspect contact continuity'],
    ['从零根导线开始', 'Start with zero wires'], ['重新开始', 'Start Over'], ['焊接步骤演示', 'Soldering Step Demo'], ['在演示中载入已焊总线', 'Load reported soldered wires'], ['当前进度', 'Progress'], ['建议下一步', 'Suggested next step'], ['焊接这根线', 'Solder This Wire'], ['撤回上一根', 'Undo Last Wire'], ['每根线焊完后', 'After each wire'], ['已经加入的导线', 'Wires already added'],
    ['固定外部导线', 'Fixed External Wires'], ['每根线的首端与尾端', 'Start and End of Every Wire'], ['打印当前清单', 'Print Current List'], ['只看某一部分', 'Filter by section'], ['编号', 'ID'], ['首端点', 'Start Point'], ['尾端点', 'End Point'], ['所属网络', 'Network'], ['当前状态', 'Current Status'],
    ['焊接前门槛', 'Pre-Soldering Checkpoint'], ['实物触点与元件测量登记', 'Physical Contacts & Component Measurements'], ['清空登记', 'Clear Records'], ['焊接放行状态', 'Soldering Release Status'], ['尚未放行', 'Not Released'], ['收到的实际物品照片', 'Photos of the Actual Components'], ['放大查看实际物品照片', 'Enlarge the component photo'], ['照片用于识别元件和规划测量，不能单独证明焊脚导通关系。', 'Photos help identify components and plan measurements; they cannot prove lug continuity by themselves.'], ['必须完成的测量', 'Required Measurements'], ['从照片看到但仍需确认的数值', 'Values seen in photos but still to confirm'], ['输出插座确认', 'Output Jack Check'], ['尚未测量', 'Not measured yet'],
    ['确认一个位置为 1–2、4–5；另一个位置为 2–3、5–6。', 'Confirm one position is 1–2, 4–5; the other is 2–3, 5–6.'], ['独立测量，不能仅假定与另一只同向。', 'Measure independently; do not assume it matches another switch.'], ['独立测量并在实物背面贴触点标签。', 'Measure independently and label the physical lugs.'], ['记录拨杆方向与背面焊脚方向。', 'Record lever direction and rear lug orientation.'], ['确认两组公共触点都是中间焊脚。', 'Confirm the common lug in both rows is the middle lug.'], ['逐行确认 1–2 / 2–3、4–5 / 5–6、7–8 / 8–9、10–11 / 11–12。', 'Check each row: 1–2 / 2–3, 4–5 / 5–6, 7–8 / 8–9, 10–11 / 11–12.'],
    ['Tip 信号触点', 'Tip signal contact'], ['Sleeve 接地触点', 'Sleeve ground contact'], ['音色电容表面字样', 'Tone capacitor marking'], ['总音量电位器实测总阻值', 'Measured master volume resistance'], ['总音色电位器实测总阻值', 'Measured master tone resistance'], ['例如：223J 250V', 'e.g. 223J 250V'], ['已用插头确认 Tip 与 Sleeve', 'Tip and Sleeve confirmed with a plug'],
    ['当前连接：1 号接矩阵输出，2 号接 Tip，3 号接公共地。', 'Current wiring: lug 1 to matrix output, lug 2 to Tip, lug 3 to common ground.'], ['当前连接：1 号接矩阵输出，2 号经音色电容接公共地，3 号空置。', 'Current wiring: lug 1 to matrix output, lug 2 to common ground through the tone capacitor, lug 3 unused.'],
    ['已完成', 'completed'], ['正在工作', 'Active'], ['没有拾音器进入输出回路', 'No pickup is in the output circuit'], ['输出被接地：静音，没有拾音器回路', 'Output is grounded: muted, no pickup path'], ['主体矩阵静音：输出总线被直接接到公共信号地', 'Matrix muted: output bus is directly connected to common signal ground'],
    ['用户报告已焊；', 'Reported soldered; '], ['连接在当前信号路径上', 'Connected in the current signal path'], ['当前不在有效信号路径上', 'Not in the active signal path'], ['点击清单中的一根导线，查看它的首端点、尾端点和当前作用。', 'Click a wire in the list to inspect its start point, end point, and current function.'],
    ['总音量 2 号触角接输出插座 Tip', 'Master Volume lug 2 to output jack Tip'], ['总音量 1 号触角', 'Master Volume lug 1'], ['号触角', ' lug'], ['号触点', ' contact'], ['首端：', 'Start: '], ['尾端：', 'End: '], ['外壳焊点', 'case lug'], ['外壳', 'case'], ['接地端', 'ground terminal'], ['地', 'ground'], ['输入', 'input'], ['输出', 'output'], ['接地', 'ground'], ['回路', 'circuit'], ['路径', 'path'], ['触点', 'contact'], ['焊接', 'solder'], ['测量', 'measure'], ['确认', 'confirm'], ['工作', 'active'], ['旁路', 'bypass'], ['启用', 'on'], ['断开', 'off'], ['位置', 'position'], ['当前', 'current'], ['总', 'master'], ['音量', 'volume'], ['音色', 'tone'], ['拾音器', 'pickup'], ['琴颈', 'neck'], ['琴中', 'middle'], ['琴桥', 'bridge'], ['公共', 'common'], ['信号', 'signal'], ['矩阵', 'matrix'], ['固定', 'fixed'], ['导线', 'wire'], ['网络', 'network'], ['全部', 'all'], ['没有', 'No '], ['经', ' through '], ['返回', ' return'], ['等待', 'pending'], ['未完成前', 'Until complete'], ['实物', 'physical'], ['外壳', 'case']
  ];
  const englishResidualPhrases = [
    ['项目状态', 'Project Status'], ['页面区域', 'Page Areas'], ['中文', 'Chinese'],
    ['内部闭合：1–2、4–5、7–8、10–11', 'Closed contacts: 1–2, 4–5, 7–8, 10–11'],
    ['内部闭合：2–3、5–6、8–9、11–12', 'Closed contacts: 2–3, 5–6, 8–9, 11–12'],
    ['开关 A / NP', 'Switch A / NP'], ['开关 B / MP', 'Switch B / MP'], ['开关 C / BP', 'Switch C / BP'],
    ['拾音器状态', 'Pickup Status'], ['Phase 方向', 'Phase Direction'], ['1 条', '1 path'], ['0 条拾音器路径', '0 pickup paths'],
    ['测试009 · Master Parallel', 'Test 009 · Master Parallel'], ['测试009 · Master Series', 'Test 009 · Master Series'],
    ['mastervolume内部滑动network', 'master volume internal wiper network'], ['输出插座 Tip', 'Output Jack Tip'], ['输出插座 Sleeve', 'Output Jack Sleeve'], ['公共信号地（回路闭合）', 'Common Signal Ground (circuit closed)'],
    ['音色支路', 'Tone branch'], ['mastertone内部可变电阻', 'master tone variable resistor'], ['通过量取决于tone旋钮position与signal频率', 'Amount passed depends on the tone knob position and signal frequency'],
    ['current显示：current完整circuit。点击任意wire或contact可以继续追踪单一network。', 'Current view: complete circuit. Click any wire or contact to trace one network.'],
    ['主outputcircuit闭合；Neck Pickupactive；tone支路Parallelground', 'Main output circuit closed; Neck Pickup active; tone branch connected to ground in parallel'],
    ['三pickup七开关matrix完整contact图', 'Complete three-pickup seven-switch contact diagram'], ['从下往上：左列 1、2、3｜右列 4、5、6', 'Bottom to top: left column 1, 2, 3 | right column 4, 5, 6'],
    ['左', 'Left'], ['右', 'Right'], ['总串联 / 并联开关 D', 'Master Series / Parallel Switch D'], ['每行中间触点为公共触点', 'The middle contact in each row is the common contact'],
    ['公共信号地', 'Common Signal Ground'], ['全电路基准', 'Circuit reference ground'], ['地', 'Ground'], ['外壳', 'Case'],
    ['背面观察、触角朝下：1、2、3', 'Viewed from the back, lugs point down: 1, 2, 3'], ['背面观察、触角朝上：3、2、1', 'Viewed from the back, lugs point up: 3, 2, 1'],
    ['1 输入 · 2 输出 · 3 接地', '1 input · 2 output · 3 ground'], ['1 输入 · 2 经电容接地 · 3 空置', '1 input · 2 to ground through capacitor · 3 unused'], ['无极性', 'Non-polarized'], ['总音色2 → 电容 → 公共地', 'Master Tone 2 → capacitor → common ground'],
    ['单声道输出插座', 'Mono Output Jack'], ['Tip 信号 / Sleeve 返回', 'Tip signal / Sleeve return'], ['返回公共地', 'Return to common ground'], ['外部音箱 / 声卡', 'External Amp / Audio Interface'], ['吉他线另一端的输入负载', 'Input load at the other end of the guitar cable'], ['外部负载闭合 Tip–Sleeve 回路', 'External load closes the Tip–Sleeve circuit'],
    ['上排：琴颈、琴中、琴桥拾音器控制开关 A / B / C', 'Top row: Neck, Middle, and Bridge Pickup Control Switches A / B / C'], ['下排：琴颈、琴中、琴桥三个独立 Phase 开关', 'Bottom row: three independent Neck, Middle, and Bridge Phase Switches'], ['三个拾音器；A、B 为线圈两端，屏蔽线不进入 Phase 开关', 'Three pickups; A and B are the coil ends; the shield wire does not enter the Phase switches'], ['总串联 / 并联', 'Master Series / Parallel'], ['音量、音色与输出级', 'Volume, tone, and output stage'], ['NET-OUT：A5—B4—C3—C5—总音量1—总音色1', 'NET-OUT: A5—B4—C3—C5—Master Volume 1—Master Tone 1'],
    ['Middle Pickup Phase 第一outputnetwork', 'Middle Pickup Phase output network 1'], ['Middle Pickup Phase 第二outputnetwork', 'Middle Pickup Phase output network 2'], ['Bridge Pickup Phase 第一outputnetwork', 'Bridge Pickup Phase output network 1'], ['Bridge Pickup Phase 第二outputnetwork', 'Bridge Pickup Phase output network 2'], ['neck与middle路由network', 'Neck-to-Middle routing network'], ['mastervolumeoutput与 Tip', 'Master Volume output and Tip'], ['masterTone Capacitor支路', 'Master Tone capacitor branch'], ['middle与bridge路由network', 'Middle-to-Bridge routing network'], ['Neck Pickup引线', 'Neck Pickup lead'], ['Middle Pickup引线', 'Middle Pickup lead'], ['Bridge Pickup引线', 'Bridge Pickup lead'], ['外部音箱 / 声卡input', 'External Amp / Audio Interface input'], ['matrixoutput至mastertone支路', 'Matrix output to Master Tone branch'],
    ['本次circuit模型：', 'Current circuit model:'], ['Neck Pickupon/bypass开关 A：2–1、5–4 闭合', 'Neck Pickup Enable/Bypass Switch A: 2–1, 5–4 closed'], ['Neck Pickup Phase 开关：2–1、5–4 闭合', 'Neck Pickup Phase Switch: 2–1, 5–4 closed'], ['检查path穿过线圈的方向：B → A', 'Check path through the coil: B → A'], ['已off，并与完整outputpath隔离', 'Off and isolated from the complete output path'], ['Middle Pickupon/bypass开关 B：2–3、5–6 闭合', 'Middle Pickup Enable/Bypass Switch B: 2–3, 5–6 closed'], ['Middle Pickup Phase 开关：2–1、5–4 闭合', 'Middle Pickup Phase Switch: 2–1, 5–4 closed'], ['Bridge Pickupon/bypass开关 C：2–3、5–6 闭合', 'Bridge Pickup Enable/Bypass Switch C: 2–3, 5–6 closed'], ['Bridge Pickup Phase 开关：2–1、5–4 闭合', 'Bridge Pickup Phase Switch: 2–1, 5–4 closed'],
    ['Neck Pickup控制开关 A', 'Neck Pickup Control Switch A'], ['Middle Pickup控制开关 B', 'Middle Pickup Control Switch B'], ['Bridge Pickup控制开关 C', 'Bridge Pickup Control Switch C'], ['图示左档：1–2、4–5 闭合', 'Diagram left position: 1–2, 4–5 closed'], ['图示右档：2–3、5–6 闭合', 'Diagram right position: 2–3, 5–6 closed'], ['在master图中查看', 'View in the master diagram'], ['← 左档　拨杆沿页面左右移动　右档 →', '← Left position   lever moves horizontally   Right position →'], ['current内部导通：1–2；4–5', 'Current internal continuity: 1–2; 4–5'], ['current内部导通：2–3；5–6', 'Current internal continuity: 2–3; 5–6'], ['Parallel档（左档）', 'Parallel position (left)'], ['current内部导通：1–2；4–5；7–8；10–11', 'Current internal continuity: 1–2; 4–5; 7–8; 10–11'],
    ['0 / 43 根', '0 / 43 wires'], ['三只pickup零线延长已焊；部分outputmaster线已焊', 'The three pickup ground extensions are soldered; some master output wires are soldered'], ['主体matrix与outputcircuit的 43 段wire', '43 wires in the main matrix and output circuit'], ['Neck Pickup部分', 'Neck Pickup section'], ['Middle Pickup部分', 'Middle Pickup section'], ['Bridge Pickup部分', 'Bridge Pickup section'], ['主体master路由', 'Main master routing'], ['主体Common Signal Ground', 'Main Common Signal Ground'], ['NET-OUT 主体master线', 'NET-OUT main master wires'], ['mastervolume、mastertone、电容、Tip / Sleeve 与External Load', 'Master Volume, Master Tone, capacitor, Tip / Sleeve, and External Load'], ['下一步：逐项做导通、短路和实物脚位复核。', 'Next: verify continuity, shorts, and physical lug mapping item by item.'],
    ['项目状态', 'Project Status'], ['当前', 'Current'], ['显示', 'View'], ['完整', 'complete'], ['图纸显示模式', 'Diagram view mode'], ['内部滑动网络', 'internal wiper network'], ['输出插座', 'Output Jack'], ['闭合', 'closed'], ['支路', 'branch'], ['内部可变电阻', 'internal variable resistor'], ['通过量取决于', 'Amount passed depends on '], ['旋钮', 'knob'], ['频率', 'frequency'], ['网络', 'network'], ['触点', 'contact'], ['接地', 'ground'], ['输入', 'input'], ['输出', 'output'], ['回路', 'circuit'], ['路径', 'path'], ['开关', 'Switch'], ['方向', 'Direction'], ['状态', 'Status'], ['或', 'or'], ['条', ' paths'], ['已', 'Already '], ['经', ' through '], ['与', ' and '], ['为', ' are '], ['至', ' to '], ['从', 'From '], ['上排', 'Top row'], ['下排', 'Bottom row'], ['左列', 'left column'], ['右列', 'right column'], ['从下往上', 'Bottom to top'], ['端', ' end'], ['总', 'Master '], ['音量', 'Volume'], ['音色', 'Tone'], ['拾音器', 'Pickup'], ['琴颈', 'Neck'], ['琴中', 'Middle'], ['琴桥', 'Bridge'], ['公共', 'Common'], ['信号', 'Signal'], ['矩阵', 'Matrix'], ['固定', 'Fixed'], ['导线', 'Wire'], ['全部', 'All'], ['没有', 'No '], ['等待', 'Pending'], ['实物', 'Physical'], ['背面观察', 'Viewed from the back'], ['触角朝下', 'lugs point down'], ['触角朝上', 'lugs point up'], ['空置', 'unused'], ['无极性', 'non-polarized'], ['返回', 'return'], ['加入', 'Add '], ['根', ' wires'], ['建议', 'Suggested'], ['下一步', 'next step'], ['焊接', 'solder'], ['测量', 'measure'], ['确认', 'confirm'], ['工作', 'active'], ['旁路', 'bypass'], ['启用', 'on'], ['断开', 'off'], ['位置', 'position'], ['短路', 'shorts'], ['导通', 'continuity'], ['真实金属脚位', 'real metal lugs']
  ];
  englishPhrases.push(...englishResidualPhrases);
  const englishFallbackRules = [
    [/Parallelsignalpath/g, 'Parallel signal path'], [/mastervolume/g, 'Master Volume'], [/mastertone/g, 'Master Tone'], [/commonground/g, 'common ground'],
    [/current/g, 'current '], [/outputcircuit/g, 'output circuit'], [/outputpath/g, 'output path'], [/outputnetwork/g, 'output network'], [/contact图/g, 'contact diagram'],
    [/测试/g, 'Test '], [/主/g, 'Main '], [/图/g, 'diagram'], [/控制/g, 'Control '], [/第一/g, '1'], [/第二/g, '2'], [/路由/g, 'routing'], [/引线/g, 'lead'],
    [/本次/g, 'Current '], [/检查/g, 'Check '], [/穿过/g, 'through '], [/线圈/g, 'coil'], [/隔离/g, 'isolated'], [/图示/g, 'Diagram '], [/档/g, ' position'],
    [/从左到右为/g, 'from left to right:'], [/左档/g, 'left position'], [/右档/g, 'right position'], [/短跳线/g, 'short jumper'], [/施工/g, 'build'], [/建议/g, 'suggestion'],
    [/你报告的/g, 'Your reported '], [/进度/g, 'progress'], [/三只/g, 'Three '], [/零线/g, 'ground wires'], [/延长/g, 'extension'], [/已焊/g, 'soldered'], [/部分/g, 'some '],
    [/功能定义/g, 'function definition'], [/目前/g, 'currently'], [/只记/g, 'recorded only as'], [/冒充/g, 'assume'], [/接到/g, 'connect to'], [/先完成/g, 'First complete '], [/背面/g, 'back of the '],
    [/最短/g, 'shortest'], [/端点/g, 'endpoint'], [/容易核对/g, 'easy to verify'], [/两个/g, 'two '], [/它们/g, 'they'], [/相邻/g, 'adjacent '], [/通过逻辑验证/g, 'passed logical verification'],
    [/尚未补全/g, 'not yet complete'], [/只有完成/g, 'Only after completing '], [/数字名称/g, 'numeric names'], [/可以对应/g, 'can correspond to'], [/按老师图逆时针旋转后的/g, 'Counter-clockwise rotated drawing '], [/标记/g, 'marking'], [/上行/g, 'top row'], [/中行/g, 'middle row'], [/下行/g, 'bottom row'],
    [/是/g, ' is '], [/和/g, ' and '], [/与/g, ' and '], [/为/g, ' are '], [/的/g, ' of '], [/不替代/g, 'does not replace '], [/每一步/g, 'each step'], [/逐项做/g, 'verify item by item: '], [/清晰抄录/g, 'copy clearly'], [/完整字样/g, 'full marking'], [/请以/g, 'use '], [/为准/g, 'as the reference'],
    [/触角/g, 'lug'], [/滑动端/g, 'wiper'], [/旋转/g, 'rotation'], [/阻值/g, 'resistance'], [/金属底板/g, 'metal baseplate'], [/屏蔽线/g, 'shield wire'], [/直流电阻/g, 'DC resistance'], [/不要只凭/g, 'Do not rely only on '], [/颜色判断/g, 'color to identify'],
    [/电位器/g, 'potentiometers'], [/插入插头后/g, 'After plugging in, '], [/万用表/g, 'multimeter'], [/确认/g, 'confirm'], [/每只/g, 'each'], [/真实/g, 'real'], [/脚位/g, 'lug mapping'], [/关闭/g, 'Close'], [/稳定/g, 'stable'], [/拓扑验证/g, 'topology verification'], [/流动/g, 'flow'], [/物理/g, 'physical'], [/焊前/g, 'before soldering'],
    [/点击任意/g, 'Click any '], [/可以继续追踪/g, 'can continue tracing '], [/模型/g, 'model'], [/本次/g, 'Current '], [/在/g, 'in '], [/查看/g, 'view'], [/演示中/g, 'In the demo, '], [/顺序优先处理/g, 'the order prioritizes '], [/再/g, 'then '], [/最后/g, 'finally '], [/连/g, 'connect '], [/它/g, 'it'], [/建议/g, 'suggestion'], [/不替代/g, 'does not replace '], [/报告/g, 'report'], [/目前/g, 'currently'], [/只记为/g, 'recorded as '], [/不冒充/g, 'do not assume '], [/交叉/g, 'cross'], [/跳线/g, 'jumper'], [/近/g, 'near'], [/最容易核对/g, 'easy to verify'], [/两个/g, 'two '], [/不导通/g, 'not continuous'], [/端点名称/g, 'endpoint names'], [/尚未/g, 'not yet '], [/补全/g, 'complete'], [/实物脚位/g, 'physical lugs'], [/按/g, 'According to '], [/后的/g, ' after '], [/上行/g, 'top row'], [/中行/g, 'middle row'], [/下行/g, 'bottom row'], [/拨杆沿页面左右方向操作/g, 'move the lever left and right on the page'], [/找出/g, 'Find '], [/记录/g, 'Record '], [/不要/g, 'Do not '], [/只凭/g, 'rely only on '], [/以及/g, ' and '], [/关系/g, 'relationship'], [/两个电位器/g, 'Two potentiometers'], [/旋转方向/g, 'rotation direction'], [/中间/g, 'middle'], [/插入/g, 'insert '], [/抄录/g, 'copy '], [/可能/g, 'may be '], [/即约/g, 'approximately '], [/约/g, 'about '], [/请/g, 'please '], [/以/g, 'use '], [/为准/g, 'as the reference'], [/清楚/g, 'clearly'], [/字样/g, 'marking'], [/元件/g, 'component'], [/主体/g, 'Main '], [/已经/g, 'already '], [/通过/g, 'passed '], [/用于/g, 'used to '], [/查找/g, 'find '], [/仍需/g, 'still need to '], [/四/g, 'four'], [/页/g, 'page'], [/不能/g, 'cannot '], [/直接/g, 'directly '], [/对应/g, 'correspond to '], [/真实金属焊脚/g, 'real metal lugs'], [/屏蔽/g, 'shield'], [/颜色/g, 'color'], [/判断/g, 'identify'], [/旋钮/g, 'knob'], [/函数/g, 'function'], [/定义/g, 'definition'], [/已焊/g, 'soldered'], [/延长接头/g, 'extension joint'], [/不/g, 'not '], [/能/g, 'can '], [/连/g, 'connect '], [/且/g, 'and '], [/为/g, 'are '], [/将/g, 'will '], [/如/g, 'as '], [/下/g, 'lower'], [/上/g, 'upper'], [/左/g, 'left'], [/右/g, 'right'], [/是/g, 'is'], [/有/g, 'has '], [/表/g, 'meter'], [/约/g, 'about '], [/准/g, 'reference'], [/清/g, 'clear'], [/晰/g, ''], [/抄/g, 'copy'], [/录/g, 'record'], [/标/g, 'label'], [/题/g, 'item'], [/电/g, 'electrical'], [/气/g, ''], [/焊/g, 'solder'], [/作/g, 'operation'], [/用/g, 'use'], [/体/g, 'body'], [/的/g, ' of '], [/了/g, ' completed'], [/着/g, ''], [/第/g, ''], [/个/g, ''], [/项/g, ' items'], [/段/g, ' sections'], [/根/g, ' wires'], [/中/g, ' middle'], [/端/g, ' end'], [/点/g, ' point'], [/两/g, 'two '], [/首/g, 'start '], [/尾/g, 'end '], [/首/g, 'start '], [/尾/g, 'end '], [/上/g, 'upper'], [/下/g, 'lower'], [/旁/g, 'side'], [/路/g, 'route'], [/返/g, 'return'], [/和/g, ' and '], [/与/g, ' and '], [/及/g, ' and '], [/取/g, 'take '], [/决/g, 'decide'], [/于/g, ' on '], [/旋/g, 'rotate'], [/能/g, 'can '], [/向/g, 'direction'], [/形/g, 'form'], [/成/g, 'become'], [/流/g, 'flow'], [/动/g, 'move'], [/无/g, 'no '], [/只/g, 'only '], [/全/g, 'all'], [/三/g, 'three'], [/七/g, 'seven'], [/五/g, 'five'], [/四/g, 'four'], [/二/g, 'two'], [/一/g, 'one'], [/八/g, 'eight'], [/九/g, 'nine'], [/十/g, 'ten']
  ];
  englishFallbackRules.push(
    [/箭头/g, 'arrows'], [/阅读/g, 'reading'], [/音频/g, 'audio'], [/永远/g, 'always'], [/单/g, 'single'], [/画/g, 'diagram'], [/查/g, 'check'], [/示/g, 'show'], [/交/g, 'alternating'], [/并/g, 'and '], [/种/g, 'types'], [/面/g, 'page'], [/前/g, 'before'],
    [/内/g, 'internal '], [/部/g, 'section'], [/到/g, ' to '], [/仍/g, 'still '], [/要/g, 'need to '], [/滑/g, 'slide '], [/接/g, 'connect '], [/长/g, 'long '], [/距/g, 'distance'], [/离/g, ' away'], [/级/g, 'stage'], [/线/g, 'wire'], [/头/g, 'head'], [/完/g, 'complete'], [/最/g, 'most '], [/容/g, 'capacity'], [/映/g, 'map'], [/射/g, 'map'], [/后/g, 'after'], [/才/g, 'then '], [/金/g, 'metal '], [/属/g, 'metal '], [/脚/g, 'lugs'], [/名/g, 'name'], [/称/g, 'label'], [/老/g, 'reference '], [/师/g, 'guide'], [/逆/g, 'counter-'], [/时/g, 'clockwise'], [/针/g, 'wise'], [/拨/g, 'move '], [/杆/g, 'lever'], [/沿/g, 'along '], [/操/g, 'operate'], [/复/g, 're-'], [/核/g, 'verify'], [/则/g, 'then'], [/同/g, 'same'], [/照/g, 'photo'], [/片/g, 'photo'], [/读/g, 'read'], [/数/g, 'values']
  );
  englishFallbackRules.push(
    [/^Parallel signal path.*common ground$/g, 'Parallel signal path reaches Master Volume, Tip, External Load, and Sleeve, then returns to common ground'],
    [/^Series signal path.*common ground$/g, 'Series signal path reaches Master Volume, Tip, External Load, and Sleeve, then returns to common ground'],
    [/Master SeriesorParallel/g, 'Master Series or Parallel'], [/Pickuponoroff/g, 'Pickup on or off'], [/PickupPhaseDirection/g, 'Pickup Phase Direction'],
    [/matrixoutput/g, 'Matrix output'], [/Master Volume1/g, 'Master Volume 1'], [/Master Volume2/g, 'Master Volume 2'], [/Master Tone1/g, 'Master Tone 1'], [/Master Tone2/g, 'Master Tone 2'],
    [/Master Volumeinternal wiper network/g, 'Master Volume internal wiper network'], [/Master Toneinternal variable resistor/g, 'Master Tone internal variable resistor'],
    [/toneknobposition and signalfrequency/g, 'tone knob position and signal frequency'], [/current View：current completecircuit。Click any wireorcontactcan continue tracing singleonenetwork。/g, 'Current view: complete circuit. Click any wire or contact to trace one network.'],
    [/Master Parallel · Test 009（M2\+F1）/g, 'Master Parallel · Test 009 (M2 + F1)'], [/Main output circuitclosed；Neck Pickupactive；Tone branchParallelground/g, 'Main output circuit closed; Neck Pickup active; Tone branch connected to ground in parallel'],
    [/current 内部continuity/g, 'Current internal continuity'], [/diagram示Left position/g, 'Diagram left position'], [/Viewed from the back、lugs point down：From Left到Right are/g, 'Viewed from the back, lugs point down: from left to right are'], [/Viewed from the back、lugs point up：From Left到Right are/g, 'Viewed from the back, lugs point up: from left to right are'],
    [/physical仍要usemultimeterconfirm滑move end and rotationDirection/g, 'physical hardware still requires a multimeter to confirm the wiper and rotation direction'], [/In the demo,  of the order prioritizes/g, 'In the demo, the order prioritizes'], [/connect 接pickup/g, 'connect the pickup'], [/长距离routing/g, 'long-distance routing'], [/output级/g, 'output stage'], [/Three pickupground wiresextensionAlready solder/g, 'Three pickup ground-wire extensions are already soldered'], [/some outputmaster线Already solder/g, 'some master output wires are already soldered'], [/current function definition are/g, 'Current function definition:'], [/pickupground wirescurrentlyrecorded only as are/g, 'Pickup ground wires are currently recorded only as'], [/extension接头完become/g, 'extension joint completed'], [/W07 · neck Phase cross线one/g, 'W07 · Neck Phase cross-wire 1'], [/First complete Switchback of the shortest of crossjumper/g, 'First complete the shortest cross-jumper on the back of the switch'], [/end pointnear、最easy to verify/g, 'nearby endpoints are easiest to verify'], [/Main bodymatrix end pointnetworkAlready/g, 'Main matrix endpoint network has already'], [/electrical容/g, 'capacitor'], [/multimeterphysical映射后/g, 'after physical multimeter mapping'], [/Main 体matrix/g, 'Main matrix'], [/NET-OUT Main 体master线/g, 'NET-OUT main master wires'], [/Master Volume、Master Tone、electrical容/g, 'Master Volume, Master Tone, capacitor'], [/itemscomponentmeasure/g, 'component measurements'], [/pagepage middle of  end point名称cannot directly correspond to real金属solder脚/g, 'page endpoint names cannot directly correspond to real metal lugs'], [/According to 老师diagram逆时针rotation后 of Directionmarking/g, 'According to the reference diagram after counter-clockwise rotation, the direction marking'], [/拨杆沿pagepageLeftRightDirection操operation/g, 'move the lever left and right on the page'], [/Find coiltwo  end、shield wire，并Record DC resistance/g, 'Find the two coil ends and shield wire, then record DC resistance'], [/measuremasterresistance、rotationDirection and middle滑move end/g, 'Measure master resistance, rotation direction, and the middle wiper'], [/复核Master Volume/g, 'Confirm Master Volume'], [/copy clearlycompletemarking；has electrical容meter则同时measure/g, 'Copy the full marking clearly; if a capacitor meter is available, measure it as well'], [/照片 middlemay be  is  223J/g, 'The photo may show 223J'], [/Main bodymatrix of 128种stableSwitchStatusAlready passed topology verification/g, 'The main matrix has 128 stable switch states verified by topology'], [/pagepage middle of flowDirection用于查找closedcircuit；physicalsolder前still need to usemultimeterconfirmeachSwitch of real metal lugs/g, 'The flow direction is for tracing the closed circuit; before physical soldering, use a multimeter to confirm every switch and its real metal lugs']
  );
  const localize = value => {
    if (state.language !== 'en' || value === undefined || value === null) return value;
    const translated = englishPhrases
      .slice()
      .sort((a, b) => b[0].length - a[0].length)
      .reduce((text, [from, to]) => text.split(from).join(to), String(value));
    return englishFallbackRules.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), translated);
  };

  const staticTextNodes = [];
  const staticAttributes = [];
  const captureStaticContent = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement.closest('script,style')) staticTextNodes.push({ node, original: node.nodeValue });
    }
    document.querySelectorAll('body *').forEach(element => {
      ['aria-label', 'alt', 'placeholder', 'title'].forEach(attribute => {
        if (element.hasAttribute(attribute)) staticAttributes.push({ element, attribute, original: element.getAttribute(attribute) });
      });
    });
  };
  const applyStaticLanguage = () => {
    staticTextNodes.forEach(item => { item.node.nodeValue = localize(item.original); });
    staticAttributes.forEach(item => item.element.setAttribute(item.attribute, localize(item.original)));
    document.documentElement.lang = state.language === 'en' ? 'en' : 'zh-CN';
    document.title = localize('三拾音器矩阵电路实验台');
    const toggle = document.getElementById('language-toggle');
    if (toggle) {
      toggle.textContent = state.language === 'en' ? '中文' : 'English';
      toggle.setAttribute('aria-label', state.language === 'en' ? 'Switch to Chinese' : '切换到英文');
    }
  };

  const pickupDefinitions = [
    { id: 'neck', prefix: 'NP', control: 'A', name: '琴颈拾音器', color: '#1769aa' },
    { id: 'middle', prefix: 'MP', control: 'B', name: '琴中拾音器', color: '#6750a4' },
    { id: 'bridge', prefix: 'BP', control: 'C', name: '琴桥拾音器', color: '#b54708' }
  ];

  const dpdtLugNumbers = { a1: '1', T1: '2', a2: '3', b1: '4', T2: '5', b2: '6' };
  const reportedCompletedWires = ['W26', 'W27', 'W28', 'W34'];

  const hardWireGroups = [
    { id: 'neck-phase-output', label: '琴颈拾音器 Phase 输出网络', members: ['NP.a1', 'NP.b2', 'D.2'] },
    { id: 'ground', label: '公共信号地网络', members: ['NP.a2', 'NP.b1', 'A.T1', 'D.4', 'D.10', 'VOL.3', 'VOL.case', 'TONE.case', 'CAP.2', 'JACK.sleeve', 'GND'] },
    { id: 'middle-phase-output-1', label: '琴中拾音器 Phase 第一输出网络', members: ['MP.a1', 'MP.b2', 'D.8'] },
    { id: 'middle-phase-output-2', label: '琴中拾音器 Phase 第二输出网络', members: ['MP.a2', 'MP.b1', 'D.5'] },
    { id: 'bridge-phase-output-1', label: '琴桥拾音器 Phase 第一输出网络', members: ['BP.a1', 'BP.b2', 'D.11'] },
    { id: 'bridge-phase-output-2', label: '琴桥拾音器 Phase 第二输出网络', members: ['BP.a2', 'BP.b1', 'C.b1'] },
    { id: 'route-a', label: '琴颈与琴中路由网络', members: ['A.a2', 'B.T1', 'D.3', 'D.6'] },
    { id: 'route-neck', label: '琴颈旁路网络', members: ['A.b1', 'D.1'] },
    { id: 'output', label: '矩阵输出总线', members: ['A.T2', 'B.b1', 'C.a2', 'C.T2', 'VOL.1', 'TONE.1', 'OUT'] },
    { id: 'volume-output', label: '总音量输出与 Tip', members: ['VOL.2', 'JACK.tip'] },
    { id: 'tone-capacitor', label: '总音色电容支路', members: ['TONE.2', 'CAP.1'] },
    { id: 'route-middle', label: '琴中旁路网络', members: ['B.T2', 'D.7'] },
    { id: 'route-b', label: '琴中与琴桥路由网络', members: ['B.a2', 'C.T1', 'D.9'] },
    { id: 'route-bridge', label: '琴桥旁路网络', members: ['C.a1', 'D.12'] }
  ];

  const wires = [
    { id: 'W01', from: 'PNECK.plus', to: 'NP.T1', network: 'pickup-neck', group: 'neck', label: '琴颈拾音器 A 端线' },
    { id: 'W02', from: 'PNECK.minus', to: 'NP.T2', network: 'pickup-neck', group: 'neck', label: '琴颈拾音器 B 端线' },
    { id: 'W03', from: 'PMIDDLE.plus', to: 'MP.T1', network: 'pickup-middle', group: 'middle', label: '琴中拾音器 A 端线' },
    { id: 'W04', from: 'PMIDDLE.minus', to: 'MP.T2', network: 'pickup-middle', group: 'middle', label: '琴中拾音器 B 端线' },
    { id: 'W05', from: 'PBRIDGE.plus', to: 'BP.T1', network: 'pickup-bridge', group: 'bridge', label: '琴桥拾音器 A 端线' },
    { id: 'W06', from: 'PBRIDGE.minus', to: 'BP.T2', network: 'pickup-bridge', group: 'bridge', label: '琴桥拾音器 B 端线' },

    { id: 'W07', from: 'NP.a1', to: 'NP.b2', network: 'neck-phase-output', group: 'neck', label: '琴颈 Phase 交叉线一' },
    { id: 'W08', from: 'NP.b2', to: 'D.2', network: 'neck-phase-output', group: 'neck', label: '琴颈 Phase 输出至总开关' },
    { id: 'W09', from: 'NP.a2', to: 'NP.b1', network: 'ground', group: 'ground', label: '琴颈 Phase 交叉线二' },
    { id: 'W10', from: 'NP.b1', to: 'A.T1', network: 'ground', group: 'ground', label: '琴颈 Phase 至公共信号地网络' },
    { id: 'W11', from: 'A.T1', to: 'D.4', network: 'ground', group: 'ground', label: '公共信号地至总开关 4 号触点' },
    { id: 'W12', from: 'D.4', to: 'D.10', network: 'ground', group: 'ground', label: '总开关 4 号与 10 号触点连接' },
    { id: 'W13', from: 'D.10', to: 'GND', network: 'ground', group: 'ground', label: '总开关公共信号地引出线' },

    { id: 'W14', from: 'MP.a1', to: 'MP.b2', network: 'middle-phase-output-1', group: 'middle', label: '琴中 Phase 交叉线一' },
    { id: 'W15', from: 'MP.b2', to: 'D.8', network: 'middle-phase-output-1', group: 'middle', label: '琴中 Phase 第一输出至总开关' },
    { id: 'W16', from: 'MP.a2', to: 'MP.b1', network: 'middle-phase-output-2', group: 'middle', label: '琴中 Phase 交叉线二' },
    { id: 'W17', from: 'MP.b1', to: 'D.5', network: 'middle-phase-output-2', group: 'middle', label: '琴中 Phase 第二输出至总开关' },

    { id: 'W18', from: 'BP.a1', to: 'BP.b2', network: 'bridge-phase-output-1', group: 'bridge', label: '琴桥 Phase 交叉线一' },
    { id: 'W19', from: 'BP.b2', to: 'D.11', network: 'bridge-phase-output-1', group: 'bridge', label: '琴桥 Phase 第一输出至总开关' },
    { id: 'W20', from: 'BP.a2', to: 'BP.b1', network: 'bridge-phase-output-2', group: 'bridge', label: '琴桥 Phase 交叉线二' },
    { id: 'W21', from: 'BP.b1', to: 'C.b1', network: 'bridge-phase-output-2', group: 'bridge', label: '琴桥 Phase 第二输出至琴桥启用开关' },

    { id: 'W22', from: 'A.a2', to: 'B.T1', network: 'route-a', group: 'routing', label: '琴颈与琴中路由连接' },
    { id: 'W23', from: 'B.T1', to: 'D.3', network: 'route-a', group: 'routing', label: '路由网络至总开关 3 号触点' },
    { id: 'W24', from: 'D.3', to: 'D.6', network: 'route-a', group: 'routing', label: '总开关 3 号与 6 号触点连接' },
    { id: 'W25', from: 'A.b1', to: 'D.1', network: 'route-neck', group: 'routing', label: '琴颈旁路至总开关 1 号触点' },

    { id: 'W26', from: 'A.T2', to: 'B.b1', network: 'output', group: 'output', label: '琴颈启用开关至输出总线' },
    { id: 'W27', from: 'B.b1', to: 'C.a2', network: 'output', group: 'output', label: '琴中启用开关至输出总线' },
    { id: 'W28', from: 'C.a2', to: 'C.T2', network: 'output', group: 'output', label: '琴桥启用开关输出跳线' },
    { id: 'W29', from: 'C.T2', to: 'VOL.1', network: 'output', group: 'output', label: '矩阵输出总线接总音量 1 号触角' },

    { id: 'W30', from: 'B.T2', to: 'D.7', network: 'route-middle', group: 'routing', label: '琴中旁路至总开关 7 号触点' },
    { id: 'W31', from: 'B.a2', to: 'C.T1', network: 'route-b', group: 'routing', label: '琴中与琴桥路由连接' },
    { id: 'W32', from: 'C.T1', to: 'D.9', network: 'route-b', group: 'routing', label: '路由网络至总开关 9 号触点' },
    { id: 'W33', from: 'C.a1', to: 'D.12', network: 'route-bridge', group: 'routing', label: '琴桥旁路至总开关 12 号触点' },

    { id: 'W34', from: 'VOL.2', to: 'JACK.tip', network: 'volume-output', group: 'output-stage', label: '总音量 2 号触角接输出插座 Tip', reportedComplete: true },
    { id: 'W35', from: 'C.T2', to: 'TONE.1', network: 'tone-feed', group: 'output-stage', label: '矩阵输出总线接总音色 1 号触角' },
    { id: 'W36', from: 'TONE.2', to: 'CAP.1', network: 'tone-capacitor', group: 'output-stage', label: '总音色 2 号触角接音色电容' },
    { id: 'W37', from: 'CAP.2', to: 'VOL.3', network: 'ground', group: 'output-stage', label: '音色电容返回总音量 3 号触角与公共地' },
    { id: 'W38', from: 'VOL.3', to: 'VOL.case', network: 'ground', group: 'output-stage', label: '总音量 3 号触角接总音量外壳' },
    { id: 'W39', from: 'VOL.case', to: 'TONE.case', network: 'ground', group: 'output-stage', label: '总音量外壳接总音色外壳' },
    { id: 'W40', from: 'VOL.3', to: 'GND', network: 'ground', group: 'output-stage', label: '总音量 3 号触角接主体矩阵公共地' },
    { id: 'W41', from: 'JACK.sleeve', to: 'GND', network: 'ground', group: 'output-stage', label: '输出插座 Sleeve 返回公共地' },
    { id: 'W42', from: 'JACK.tip', to: 'LOAD.tip', network: 'external-load', group: 'output-stage', label: 'Tip 经吉他线进入外部负载' },
    { id: 'W43', from: 'LOAD.sleeve', to: 'JACK.sleeve', network: 'external-load-return', group: 'output-stage', label: '外部负载经 Sleeve 返回吉他' }
  ];

  const networkById = Object.fromEntries([
    ...hardWireGroups,
    { id: 'pickup-neck', label: '琴颈拾音器引线' },
    { id: 'pickup-middle', label: '琴中拾音器引线' },
    { id: 'pickup-bridge', label: '琴桥拾音器引线' },
    { id: 'external-load', label: '外部音箱 / 声卡输入' },
    { id: 'external-load-return', label: '外部负载 Sleeve 返回' },
    { id: 'tone-feed', label: '矩阵输出至总音色支路' }
  ].map(item => [item.id, item]));

  const networkColors = {
    'pickup-neck': '#0067c0',
    'neck-phase-output': '#0096c7',
    ground: '#087f5b',
    'pickup-middle': '#6d28d9',
    'middle-phase-output-1': '#9333ea',
    'middle-phase-output-2': '#c026d3',
    'pickup-bridge': '#b54708',
    'bridge-phase-output-1': '#e85d04',
    'bridge-phase-output-2': '#d97706',
    'route-a': '#0f766e',
    'route-neck': '#2563eb',
    output: '#d62828',
    'route-middle': '#db2777',
    'route-b': '#857000',
    'route-bridge': '#4f46e5',
    'volume-input': '#c1121f',
    'volume-output': '#e63946',
    'tone-feed': '#00838f',
    'tone-capacitor': '#7b2cbf',
    'output-ground': '#37474f',
    'external-load': '#e63946',
    'external-load-return': '#37474f'
  };

  const componentNames = {
    NP: '琴颈 Phase 开关', MP: '琴中 Phase 开关', BP: '琴桥 Phase 开关',
    A: '琴颈启用/旁路开关 A', B: '琴中启用/旁路开关 B', C: '琴桥启用/旁路开关 C',
    D: '总串联/并联开关 D', PNECK: '琴颈拾音器', PMIDDLE: '琴中拾音器',
    PBRIDGE: '琴桥拾音器', GND: '公共信号地', OUT: '矩阵输出总线',
    VOL: '总音量电位器', TONE: '总音色电位器', CAP: '音色电容',
    JACK: '单声道输出插座', BRIDGE: '琴桥金属部件', LOAD: '外部音箱 / 声卡输入'
  };

  const terminalDisplayName = terminal => {
    if (terminal === 'GND' || terminal === 'OUT') return componentNames[terminal];
    const [component, lug] = terminal.split('.');
    const specialLugs = {
      plus: 'A 端', minus: 'B 端', case: '外壳焊点', tip: 'Tip 信号触点',
      sleeve: 'Sleeve 接地触点', tipIn: 'Tip 输入', ground: '接地端', 1: '1 号触角',
      2: '2 号触角', 3: '3 号触角'
    };
    const suffix = dpdtLugNumbers[lug] ? `${dpdtLugNumbers[lug]} 号触点` : specialLugs[lug] || `${lug} 触点`;
    return `${componentNames[component]} · ${suffix}`;
  };

  const weldingOrder = [
    'W07', 'W09', 'W14', 'W16', 'W18', 'W20',
    'W12', 'W24', 'W28',
    'W01', 'W02', 'W03', 'W04', 'W05', 'W06',
    'W10', 'W11', 'W13',
    'W08', 'W15', 'W17', 'W19', 'W21',
    'W22', 'W23', 'W25',
    'W26', 'W27', 'W29',
    'W30', 'W31', 'W32', 'W33',
    'W34', 'W35', 'W36', 'W37', 'W38', 'W39', 'W40', 'W41', 'W42', 'W43'
  ];

  const weldingReason = wireId => {
    const number = Number(wireId.slice(1));
    if ([7, 9, 14, 16, 18, 20].includes(number)) return '先完成开关背面最短的交叉跳线，端点近、最容易核对。';
    if ([12, 24, 28].includes(number)) return '继续完成元件自身或相邻触点之间的短跳线，减少后续长线遮挡。';
    if (number <= 6) return '现在接入拾音器的 A、B 两端；每焊一根先测量线圈电阻是否仍正常。';
    if ([10, 11, 13].includes(number)) return '建立主体矩阵公共接地网络；焊后检查信号热端没有被误短接到地。';
    if (number === 29) return '把矩阵输出总线接到总音量 1 号触角；焊后复核 A5、B4、C3、C5 与总音量 1 号导通。';
    if (number === 34) return '这是你报告已完成的总音量 2 号至输出插座 Tip 信号线。';
    if (number >= 35) return '补齐总音色、电容、Sleeve 和外部负载返回路径；每段完成后检查是否与公共地误短接。';
    return '按主体矩阵的信号顺序连接；焊后检查本线两端导通且不碰相邻触点。';
  };

  class UnionFind {
    constructor() { this.parent = new Map(); }
    find(item) {
      if (!this.parent.has(item)) this.parent.set(item, item);
      const parent = this.parent.get(item);
      if (parent !== item) this.parent.set(item, this.find(parent));
      return this.parent.get(item);
    }
    union(...items) {
      if (!items.length) return;
      const root = this.find(items[0]);
      items.slice(1).forEach(item => {
        const other = this.find(item);
        if (other !== root) this.parent.set(other, root);
      });
    }
  }

  const fixedWireUf = new UnionFind();
  wires.forEach(wire => fixedWireUf.union(wire.from, wire.to));
  const fixedWireIdsByRoot = new Map();
  const fixedTerminalsByRoot = new Map();
  wires.forEach(wire => {
    const root = fixedWireUf.find(wire.from);
    if (!fixedWireIdsByRoot.has(root)) fixedWireIdsByRoot.set(root, new Set());
    if (!fixedTerminalsByRoot.has(root)) fixedTerminalsByRoot.set(root, new Set());
    fixedWireIdsByRoot.get(root).add(wire.id);
    fixedTerminalsByRoot.get(root).add(wire.from);
    fixedTerminalsByRoot.get(root).add(wire.to);
  });

  const clearDiagramFocus = () => {
    state.focusedNetwork = null;
    state.focusedTerminal = null;
    state.focusedWireIds = null;
    state.selectedWire = null;
  };

  const focusFixedWireNetwork = (terminal, selectedWire = null) => {
    const root = fixedWireUf.find(terminal);
    state.diagramScope = 'all';
    state.focusedNetwork = null;
    state.focusedTerminal = terminal;
    state.focusedWireIds = new Set(fixedWireIdsByRoot.get(root) || []);
    state.selectedWire = selectedWire;
  };

  const dpdtConnections = (prefix, right) => right
    ? [[`${prefix}.T1`, `${prefix}.a2`], [`${prefix}.T2`, `${prefix}.b2`]]
    : [[`${prefix}.T1`, `${prefix}.a1`], [`${prefix}.T2`, `${prefix}.b1`]];

  const fourPdtConnections = mode => mode === 'parallel'
    ? [['D.1', 'D.2'], ['D.4', 'D.5'], ['D.7', 'D.8'], ['D.10', 'D.11']]
    : [['D.2', 'D.3'], ['D.5', 'D.6'], ['D.8', 'D.9'], ['D.11', 'D.12']];

  const getInternalConnections = () => {
    const connections = [];
    pickupDefinitions.forEach(pickup => {
      dpdtConnections(pickup.prefix, state.reversed[pickup.id]).forEach(pair => connections.push({ pair, switchId: pickup.prefix }));
      dpdtConnections(pickup.control, !state.enabled[pickup.id]).forEach(pair => connections.push({ pair, switchId: pickup.control }));
    });
    fourPdtConnections(state.mode).forEach(pair => connections.push({ pair, switchId: 'D' }));
    return connections;
  };

  const buildElectricalState = () => {
    const uf = new UnionFind();
    hardWireGroups.forEach(group => uf.union(...group.members));
    uf.union('PNECK.plus', 'NP.T1');
    uf.union('PNECK.minus', 'NP.T2');
    uf.union('PMIDDLE.plus', 'MP.T1');
    uf.union('PMIDDLE.minus', 'MP.T2');
    uf.union('PBRIDGE.plus', 'BP.T1');
    uf.union('PBRIDGE.minus', 'BP.T2');
    getInternalConnections().forEach(connection => uf.union(...connection.pair));

    const coils = pickupDefinitions.map(pickup => ({
      id: pickup.id,
      name: pickup.name,
      plusRoot: uf.find(`P${pickup.id.toUpperCase()}.plus`),
      minusRoot: uf.find(`P${pickup.id.toUpperCase()}.minus`)
    }));

    const groundRoot = uf.find('GND');
    const outRoot = uf.find('OUT');
    const adjacency = new Map();
    coils.forEach(coil => {
      if (!adjacency.has(coil.plusRoot)) adjacency.set(coil.plusRoot, []);
      if (!adjacency.has(coil.minusRoot)) adjacency.set(coil.minusRoot, []);
      adjacency.get(coil.plusRoot).push({ next: coil.minusRoot, coil, direction: 'A → B' });
      adjacency.get(coil.minusRoot).push({ next: coil.plusRoot, coil, direction: 'B → A' });
    });

    const paths = [];
    const walk = (root, visitedRoots, usedPickups, path, roots) => {
      if (root === outRoot) {
        paths.push({ steps: path, roots });
        return;
      }
      (adjacency.get(root) || []).forEach(edge => {
        if (usedPickups.has(edge.coil.id) || visitedRoots.has(edge.next)) return;
        walk(
          edge.next,
          new Set([...visitedRoots, edge.next]),
          new Set([...usedPickups, edge.coil.id]),
          [...path, { pickup: edge.coil.id, name: edge.coil.name, direction: edge.direction }],
          new Set([...roots, edge.next])
        );
      });
    };

    if (groundRoot !== outRoot) walk(groundRoot, new Set([groundRoot]), new Set(), [], new Set([groundRoot]));
    const uniquePaths = [];
    const pathKeys = new Set();
    paths.forEach(path => {
      const key = path.steps.map(step => `${step.pickup}:${step.direction}`).join('|');
      if (!pathKeys.has(key)) {
        pathKeys.add(key);
        uniquePaths.push(path);
      }
    });

    const activeRoots = new Set();
    uniquePaths.forEach(path => path.roots.forEach(root => activeRoots.add(root)));
    if (groundRoot === outRoot) activeRoots.add(groundRoot);

    const rawEdges = [
      ...wires
        .filter(wire => Number(wire.id.slice(1)) <= 33)
        .map(wire => ({ id: `wire:${wire.id}`, a: wire.from, b: wire.to, type: 'wire' })),
      ...getInternalConnections().map(connection => {
        const key = connection.pair.slice().sort().join('|');
        return { id: `contact:${key}`, a: connection.pair[0], b: connection.pair[1], type: 'contact' };
      }),
      ...pickupDefinitions.map(pickup => ({
        id: `coil:${pickup.id}`,
        a: `P${pickup.id.toUpperCase()}.plus`,
        b: `P${pickup.id.toUpperCase()}.minus`,
        type: 'coil',
        pickup: pickup.id
      })),
      // The output bus is a named analysis endpoint, not a separate physical lug.
      // Anchor every physical output-bus lug to it so path tracing cannot stop
      // prematurely at a pickup terminal that shares the same union-find root.
      ...['A.T2', 'B.b1', 'C.a2', 'C.T2'].map(node => ({
        id: `net:output:${node}`,
        a: node,
        b: 'OUT',
        type: 'net'
      }))
    ];
    const rawAdjacency = new Map();
    rawEdges.forEach(edge => {
      if (!rawAdjacency.has(edge.a)) rawAdjacency.set(edge.a, []);
      if (!rawAdjacency.has(edge.b)) rawAdjacency.set(edge.b, []);
      rawAdjacency.get(edge.a).push({ ...edge, next: edge.b, forward: true, direction: edge.type === 'coil' ? 'A → B' : null });
      rawAdjacency.get(edge.b).push({ ...edge, next: edge.a, forward: false, direction: edge.type === 'coil' ? 'B → A' : null });
    });

    const findConcretePath = targetSteps => {
      const queue = [{ node: 'GND', coilIndex: 0, edges: [] }];
      const visited = new Set(['GND|0']);
      while (queue.length) {
        const current = queue.shift();
        if (current.node === 'OUT' && current.coilIndex === targetSteps.length) return current.edges;
        (rawAdjacency.get(current.node) || []).forEach(edge => {
          let nextCoilIndex = current.coilIndex;
          if (edge.type === 'coil') {
            const expected = targetSteps[current.coilIndex];
            if (!expected || edge.pickup !== expected.pickup || edge.direction !== expected.direction) return;
            nextCoilIndex += 1;
          }
          const visitKey = `${edge.next}|${nextCoilIndex}`;
          if (visited.has(visitKey)) return;
          visited.add(visitKey);
          queue.push({
            node: edge.next,
            coilIndex: nextCoilIndex,
            edges: [...current.edges, { id: edge.id, forward: edge.forward, type: edge.type, pickup: edge.pickup || null }]
          });
        });
      }
      return [];
    };

    const activeEdgeIds = new Set();
    const flowDirections = new Map();
    const flowRoles = new Map();
    const setFlowRole = (edgeId, role) => {
      const current = flowRoles.get(edgeId);
      if (!current || current === 'ground' || role === 'pickup') flowRoles.set(edgeId, role);
    };
    const targetPaths = groundRoot === outRoot ? [{ steps: [] }] : uniquePaths;
    targetPaths.forEach(path => {
      const concretePath = findConcretePath(path.steps);
      const firstCoilIndex = concretePath.findIndex(edge => edge.type === 'coil');
      concretePath.forEach((edge, index) => {
        activeEdgeIds.add(edge.id);
        if (!flowDirections.has(edge.id)) flowDirections.set(edge.id, edge.forward ? 'forward' : 'reverse');
        setFlowRole(edge.id, edge.type === 'coil' ? 'pickup' : index < firstCoilIndex ? 'ground' : 'hot');
      });
    });
    if (groundRoot !== outRoot && uniquePaths.length) {
      const outputLoop = [
        ['wire:W29', 'forward', 'hot'],
        ['component:volume', 'forward', 'hot'],
        ['wire:W34', 'forward', 'hot'],
        ['wire:W42', 'forward', 'hot'],
        ['component:load', 'forward', 'hot'],
        ['wire:W43', 'forward', 'ground'],
        ['wire:W41', 'forward', 'ground'],
        ['wire:W35', 'forward', 'hot'],
        ['component:tone', 'forward', 'hot'],
        ['wire:W36', 'forward', 'hot'],
        ['component:capacitor', 'forward', 'hot'],
        ['wire:W37', 'forward', 'ground'],
        ['wire:W40', 'forward', 'ground']
      ];
      outputLoop.forEach(([edgeId, direction, role]) => {
        activeEdgeIds.add(edgeId);
        flowDirections.set(edgeId, direction);
        setFlowRole(edgeId, role);
      });
    }

    const pickupStatus = Object.fromEntries(coils.map(coil => {
      const enabled = state.enabled[coil.id];
      const shorted = coil.plusRoot === coil.minusRoot;
      return [coil.id, { enabled, shorted, used: uniquePaths.some(path => path.steps.some(step => step.pickup === coil.id)) }];
    }));

    return { uf, coils, groundRoot, outRoot, paths: uniquePaths, activeRoots, activeEdgeIds, flowDirections, flowRoles, pickupStatus, hardGrounded: groundRoot === outRoot };
  };

  const createElement = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) {
      el.dataset.i18nSource = String(text);
      el.textContent = localize(text);
    }
    return el;
  };

  const setLocalizedText = (element, text) => {
    if (element) {
      element.dataset.i18nSource = String(text);
      element.textContent = localize(text);
    }
  };

  const refreshDynamicLanguage = () => {
    document.querySelectorAll('[data-i18n-source]').forEach(element => {
      if (!element.children.length) element.textContent = localize(element.dataset.i18nSource);
    });
  };

  const initializeTabs = () => {
    document.querySelectorAll('.tab').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(tab => {
          const active = tab === button;
          tab.classList.toggle('active', active);
          tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
          const active = panel.id === button.dataset.tab;
          panel.classList.toggle('active', active);
          panel.hidden = !active;
        });
      });
    });
  };

  const initializeControls = () => {
    const container = document.getElementById('pickup-controls');
    pickupDefinitions.forEach(pickup => {
      const card = createElement('div', 'pickup-control');
      card.style.setProperty('--pickup-color', pickup.color);
      const title = createElement('div', 'pickup-control-title');
      title.append(createElement('span', '', pickup.name), createElement('span', 'small-note', `开关 ${pickup.control} / ${pickup.prefix}`));
      card.appendChild(title);
      const pair = createElement('div', 'control-pair');

      const enableWrap = createElement('div');
      enableWrap.appendChild(createElement('span', 'mini-label', '拾音器状态'));
      const enable = createElement('div', 'switch-control');
      enable.setAttribute('role', 'group');
      enable.setAttribute('aria-label', localize(`${pickup.name}启用或断开`));
      [['on', '启用'], ['off', '断开']].forEach(([value, label]) => {
        const button = createElement('button', '', label);
        button.type = 'button';
        button.dataset.pickup = pickup.id;
        button.dataset.enable = value;
        button.addEventListener('click', () => {
          state.enabled[pickup.id] = value === 'on';
          clearDiagramFocus();
          renderAll();
        });
        enable.appendChild(button);
      });
      enableWrap.appendChild(enable);

      const phaseWrap = createElement('div');
      phaseWrap.appendChild(createElement('span', 'mini-label', 'Phase 方向'));
      const phase = createElement('div', 'switch-control');
      phase.setAttribute('role', 'group');
      phase.setAttribute('aria-label', localize(`${pickup.name}Phase方向`));
      [['normal', '位置1'], ['reverse', '位置2']].forEach(([value, label]) => {
        const button = createElement('button', '', label);
        button.type = 'button';
        button.dataset.pickup = pickup.id;
        button.dataset.phase = value;
        button.addEventListener('click', () => {
          state.reversed[pickup.id] = value === 'reverse';
          clearDiagramFocus();
          renderAll();
        });
        phase.appendChild(button);
      });
      phaseWrap.appendChild(phase);
      pair.append(enableWrap, phaseWrap);
      card.appendChild(pair);
      container.appendChild(card);
    });

    document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
      state.mode = button.dataset.mode;
      clearDiagramFocus();
      renderAll();
    }));

    document.getElementById('reset-state').addEventListener('click', () => {
      state.mode = 'parallel';
      pickupDefinitions.forEach(pickup => {
        state.enabled[pickup.id] = pickup.id === 'neck';
        state.reversed[pickup.id] = false;
      });
      clearDiagramFocus();
      state.diagramScope = 'active';
      renderAll();
    });
  };

  const updateControlStates = () => {
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', button.dataset.mode === state.mode ? 'true' : 'false'));
    pickupDefinitions.forEach(pickup => {
      document.querySelectorAll(`[data-pickup="${pickup.id}"][data-enable]`).forEach(button => {
        const pressed = (button.dataset.enable === 'on') === state.enabled[pickup.id];
        button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      });
      document.querySelectorAll(`[data-pickup="${pickup.id}"][data-phase]`).forEach(button => {
        const pressed = (button.dataset.phase === 'reverse') === state.reversed[pickup.id];
        button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      });
    });
    setLocalizedText(document.getElementById('mode-contact-summary'), state.mode === 'parallel'
      ? '内部闭合：1–2、4–5、7–8、10–11'
      : '内部闭合：2–3、5–6、8–9、11–12');
  };

  const stateOrder = bits => {
    const key = bits.map(Boolean).map(Number).join('');
    return {
      '000': 0, '100': 1, '010': 2, '001': 3,
      '110': 4, '101': 5, '011': 6, '111': 7
    }[key];
  };

  const getCurrentTest = () => {
    const enabledIndex = stateOrder(pickupDefinitions.map(pickup => state.enabled[pickup.id]));
    const phaseIndex = stateOrder(pickupDefinitions.map(pickup => state.reversed[pickup.id]));
    const number = (state.mode === 'series' ? 64 : 0) + enabledIndex * 8 + phaseIndex + 1;
    return {
      number: String(number).padStart(3, '0'),
      mainRow: `M${enabledIndex + 1 + (state.mode === 'series' ? 8 : 0)}`,
      phaseColumn: `F${phaseIndex + 1}`
    };
  };

  const closedContactsFor = pickup => ({
    control: state.enabled[pickup.id] ? '1–2、4–5' : '2–3、5–6',
    phase: state.reversed[pickup.id] ? '2–3、5–6' : '1–2、4–5'
  });

  const renderDiagramLiveStatus = electrical => {
    const working = pickupDefinitions.filter(pickup => electrical.pickupStatus[pickup.id].used);
    const test = getCurrentTest();
    const modeText = `${state.mode === 'parallel' ? '总并联' : '总串联'} · 测试${test.number}（${test.mainRow}+${test.phaseColumn}）`;
    const contactText = pickupDefinitions.flatMap(pickup => {
      const contacts = closedContactsFor(pickup);
      return [`${pickup.control}:${contacts.control}`, `${pickup.prefix}:${contacts.phase}`];
    }).concat(state.mode === 'parallel' ? ['D:1–2/4–5/7–8/10–11'] : ['D:2–3/5–6/8–9/11–12']).join('；');
    setLocalizedText(document.getElementById('diagram-mode'), modeText);
    setLocalizedText(document.getElementById('diagram-contacts'), contactText);
    setLocalizedText(document.getElementById('diagram-loop'), electrical.hardGrounded
      ? '输出被接地：静音，没有拾音器回路'
      : `主输出回路闭合；${working.map(item => item.name).join('、')}工作；音色支路并联接地`);
  };

  const renderStateSummary = electrical => {
    const working = pickupDefinitions.filter(pickup => electrical.pickupStatus[pickup.id].used);
    const test = getCurrentTest();
    setLocalizedText(document.getElementById('output-state'), state.language === 'en'
      ? (electrical.hardGrounded
        ? 'Matrix muted: output bus is directly connected to common signal ground'
        : `${state.mode === 'parallel' ? 'Parallel' : 'Series'} signal path reaches Master Volume, Tip, External Load, and Sleeve, then returns to common ground`)
      : (electrical.hardGrounded
        ? '主体矩阵静音：输出总线被直接接到公共信号地'
        : `${state.mode === 'parallel' ? '并联' : '串联'}信号路径已经总音量、Tip、外部负载和 Sleeve 返回公共地`));
    setLocalizedText(document.getElementById('active-pickups'), working.length ? working.map(item => item.name).join('、') : '没有拾音器进入输出回路');
    setLocalizedText(document.getElementById('path-count'), electrical.hardGrounded ? '0 条拾音器路径' : `${electrical.paths.length} 条`);
    setLocalizedText(document.getElementById('guitar-mode'), `测试${test.number} · ${state.mode === 'parallel' ? '总并联' : '总串联'}`);
    renderDiagramLiveStatus(electrical);

    const pathContainer = document.getElementById('signal-paths');
    pathContainer.innerHTML = '';
    if (electrical.hardGrounded) {
      const row = createElement('div', 'signal-path mute-path');
      row.append(createElement('span', 'path-node', '矩阵输出总线'), createElement('span', 'path-arrow', '→'), createElement('span', 'path-node', '公共信号地'));
      row.appendChild(createElement('span', '', '三个拾音器全部断开；这是设计中的主动静音状态。'));
      pathContainer.appendChild(row);
    } else {
      electrical.paths.forEach((path, index) => {
        const row = createElement('div', 'signal-path');
        const pathColor = path.steps.length === 1
          ? pickupDefinitions.find(item => item.id === path.steps[0].pickup)?.color
          : '#0f766e';
        row.style.setProperty('--path-color', pathColor || '#0f766e');
        row.appendChild(createElement('strong', '', `路径 ${index + 1}`));
        row.appendChild(createElement('span', 'path-node', '公共信号地'));
        path.steps.forEach(step => {
          row.appendChild(createElement('span', 'path-arrow', '→'));
          const pickup = pickupDefinitions.find(item => item.id === step.pickup);
          const node = createElement('span', 'path-node pickup', `${step.name}（${step.direction}）`);
          node.style.setProperty('--pickup-color', pickup.color);
          row.appendChild(node);
        });
        row.appendChild(createElement('span', 'path-arrow', '→'));
        row.appendChild(createElement('span', 'path-node', '矩阵输出（A5/B4/C3/C5）'));
        row.appendChild(createElement('span', 'path-arrow', '→'));
        row.appendChild(createElement('span', 'path-node', '总音量1'));
        row.appendChild(createElement('span', 'path-arrow', '→'));
        row.appendChild(createElement('span', 'path-node', '总音量内部滑动网络'));
        row.appendChild(createElement('span', 'path-arrow', '→'));
        row.appendChild(createElement('span', 'path-node', '总音量2'));
        row.appendChild(createElement('span', 'path-arrow', '→'));
        row.appendChild(createElement('span', 'path-node', '输出插座 Tip'));
        row.appendChild(createElement('span', 'path-arrow', '→'));
        row.appendChild(createElement('span', 'path-node', '外部音箱 / 声卡输入负载'));
        row.appendChild(createElement('span', 'path-arrow', '→'));
        row.appendChild(createElement('span', 'path-node', '输出插座 Sleeve'));
        row.appendChild(createElement('span', 'path-arrow', '→'));
        row.appendChild(createElement('span', 'path-node', '公共信号地（回路闭合）'));
        pathContainer.appendChild(row);
      });
      const toneRow = createElement('div', 'signal-path tone-signal-path');
      toneRow.style.setProperty('--path-color', '#00838f');
      toneRow.append(
        createElement('strong', '', '音色支路'),
        createElement('span', 'path-node', '矩阵输出'),
        createElement('span', 'path-arrow', '→'),
        createElement('span', 'path-node', '总音色1'),
        createElement('span', 'path-arrow', '→'),
        createElement('span', 'path-node', '总音色内部可变电阻'),
        createElement('span', 'path-arrow', '→'),
        createElement('span', 'path-node', '总音色2'),
        createElement('span', 'path-arrow', '→'),
        createElement('span', 'path-node', '音色电容'),
        createElement('span', 'path-arrow', '→'),
        createElement('span', 'path-node', '公共信号地'),
        createElement('span', 'frequency-note', '通过量取决于音色旋钮位置与信号频率')
      );
      pathContainer.appendChild(toneRow);
    }

    const statusContainer = document.getElementById('pickup-state-cards');
    statusContainer.innerHTML = '';
    pickupDefinitions.forEach(pickup => {
      const status = electrical.pickupStatus[pickup.id];
      const card = createElement('article', 'pickup-state-card');
      card.style.setProperty('--pickup-color', pickup.color);
      card.appendChild(createElement('h4', '', pickup.name));
      const statusLine = createElement('p');
      const statusStrong = createElement('span', `pickup-status ${status.used ? 'working' : 'off'}`,
        status.used ? '正在工作' : status.shorted ? '已断开，并被旁路短接' : '已断开，并与完整输出路径隔离');
      statusLine.appendChild(statusStrong);
      card.appendChild(statusLine);
      card.appendChild(createElement('p', '', `${pickup.name}启用/旁路开关 ${pickup.control}：${state.enabled[pickup.id] ? '2–1、5–4 闭合' : '2–3、5–6 闭合'}`));
      card.appendChild(createElement('p', '', `${pickup.name} Phase 开关：${state.reversed[pickup.id] ? '2–3、5–6 闭合' : '2–1、5–4 闭合'}`));
      if (status.used) {
        const step = electrical.paths.flatMap(path => path.steps).find(item => item.pickup === pickup.id);
        card.appendChild(createElement('p', '', `检查路径穿过线圈的方向：${step ? step.direction : '—'}`));
      }
      statusContainer.appendChild(card);
    });
  };

  const svg = document.getElementById('circuit-svg');
  const layers = {
    components: document.getElementById('component-layer'),
    wires: document.getElementById('external-wire-layer'),
    internal: document.getElementById('internal-contact-layer'),
    terminals: document.getElementById('terminal-layer'),
    labels: document.getElementById('label-layer')
  };
  const nodePositions = {};
  const componentLayouts = {};

  const addSvg = (tag, attrs, layer) => {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, String(value)));
    (layer || layers.components).appendChild(el);
    return el;
  };

  const addSvgText = (x, y, value, className, layer) => {
    const el = addSvg('text', { x, y, class: className }, layer || layers.labels);
    el.textContent = localize(value);
    return el;
  };

  const createTerminal = (id, x, y, label) => {
    nodePositions[id] = { x, y };
    const circle = addSvg('circle', { cx: x, cy: y, r: 7, class: 'terminal', 'data-terminal': id }, layers.terminals);
    circle.addEventListener('click', event => {
      event.stopPropagation();
      focusFixedWireNetwork(id);
      renderDiagram(buildElectricalState());
      renderWireTable(buildElectricalState());
    });
    addSvgText(x, y - 13, label, 'terminal-label');
  };

  const createBox = (id, x, y, width, height, title, subtitle, extraClass = '') => {
    componentLayouts[id] = { x, y, width, height };
    addSvg('rect', { x, y, width, height, class: `component-box ${extraClass}`.trim() }, layers.components);
    addSvgText(x + width / 2, y + 24, title, 'component-title');
    if (subtitle) addSvgText(x + width / 2, y + 42, subtitle, 'component-subtitle');
  };

  const toggleSwitchState = id => {
    const pickupByControl = pickupDefinitions.find(pickup => pickup.control === id);
    const pickupByPhase = pickupDefinitions.find(pickup => pickup.prefix === id);
    if (pickupByControl) state.enabled[pickupByControl.id] = !state.enabled[pickupByControl.id];
    if (pickupByPhase) state.reversed[pickupByPhase.id] = !state.reversed[pickupByPhase.id];
    if (id === 'D') state.mode = state.mode === 'parallel' ? 'series' : 'parallel';
    clearDiagramFocus();
    renderAll();
  };

  const createInlineSwitch = (id, x, y) => {
    const group = addSvg('g', {
      class: 'inline-switch',
      role: 'button',
      tabindex: '0',
      'data-inline-switch': id
    }, layers.labels);
    addSvg('rect', { x, y, width: 104, height: 28, rx: 4, class: 'inline-switch-track' }, group);
    addSvg('text', { x: x + 22, y: y + 19, class: 'inline-switch-side' }, group).textContent = localize('左');
    addSvg('text', { x: x + 82, y: y + 19, class: 'inline-switch-side' }, group).textContent = localize('右');
    addSvg('circle', { cx: x + 22, cy: y + 14, r: 11, class: 'inline-switch-knob' }, group);
    const status = addSvg('text', { x: x + 52, y: y + 42, class: 'inline-switch-status' }, group);
    status.dataset.inlineSwitchStatus = id;
    const activate = event => {
      event.stopPropagation();
      toggleSwitchState(id);
    };
    group.addEventListener('click', activate);
    group.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(event);
      }
    });
  };

  const inlineSwitchState = id => {
    const control = pickupDefinitions.find(pickup => pickup.control === id);
    if (control) return { right: !state.enabled[control.id], label: state.enabled[control.id] ? '启用：1–2、4–5' : '断开：2–3、5–6' };
    const phase = pickupDefinitions.find(pickup => pickup.prefix === id);
    if (phase) return { right: state.reversed[phase.id], label: state.reversed[phase.id] ? '位置2：2–3、5–6' : '位置1：1–2、4–5' };
    return { right: state.mode === 'series', label: state.mode === 'parallel' ? '总并联' : '总串联' };
  };

  const updateInlineSwitches = () => {
    svg.querySelectorAll('[data-inline-switch]').forEach(group => {
      const switchState = inlineSwitchState(group.dataset.inlineSwitch);
      group.classList.toggle('right', switchState.right);
      group.setAttribute('aria-label', localize(`${componentNames[group.dataset.inlineSwitch]}，当前${switchState.label}，点击切换`));
      const status = group.querySelector('[data-inline-switch-status]');
      if (status) status.textContent = localize(switchState.label);
    });
  };

  const createDpdt = (id, x, y, title) => {
    createBox(id, x, y, 200, 225, title, '从下往上：左列 1、2、3｜右列 4、5、6');
    createInlineSwitch(id, x + 48, y + 51);
    const xs = [x + 65, x + 135];
    const ys = [y + 115, y + 153, y + 191];
    ['a2', 'T1', 'a1'].forEach((lug, index) => createTerminal(`${id}.${lug}`, xs[0], ys[index], dpdtLugNumbers[lug]));
    ['b2', 'T2', 'b1'].forEach((lug, index) => createTerminal(`${id}.${lug}`, xs[1], ys[index], dpdtLugNumbers[lug]));
  };

  const createPickup = (id, x, y, title, color) => {
    createBox(id, x, y, 135, 116, title, 'A 端 / B 端', 'pickup-box');
    const pickupId = id.replace(/^P/, '').toLowerCase();
    const path = addSvg('path', { d: `M ${x + 20} ${y + 77} C ${x + 36} ${y + 52}, ${x + 50} ${y + 102}, ${x + 67} ${y + 77} C ${x + 84} ${y + 52}, ${x + 99} ${y + 102}, ${x + 115} ${y + 77}`, class: 'coil', 'data-coil': pickupId }, layers.components);
    path.style.setProperty('--pickup-color', color);
    createTerminal(`${id}.plus`, x + 20, y + 77, 'A');
    createTerminal(`${id}.minus`, x + 115, y + 77, 'B');
  };

  const createPotentiometer = (id, x, y, title, lugsUp) => {
    const subtitle = lugsUp
      ? '背面观察、触角朝上：3、2、1'
      : '背面观察、触角朝下：1、2、3';
    createBox(id, x, y, 200, lugsUp ? 190 : 175, title, subtitle);
    const centerY = lugsUp ? y + 120 : y + 82;
    addSvg('circle', { cx: x + 100, cy: centerY, r: 31, class: 'pot-body' }, layers.components);
    addSvg('circle', { cx: x + 100, cy: centerY, r: 7, class: 'pot-shaft' }, layers.components);
    const visibleNumbers = lugsUp ? [3, 2, 1] : [1, 2, 3];
    const lugY = lugsUp ? y + 72 : y + 151;
    visibleNumbers.forEach((number, index) => createTerminal(`${id}.${number}`, x + 52 + index * 48, lugY, String(number)));
    createTerminal(`${id}.case`, x + 178, centerY, '外壳');
    if (id === 'VOL') {
      const one = nodePositions['VOL.1'];
      const two = nodePositions['VOL.2'];
      addSvg('path', { d: `M ${one.x} ${one.y} Q ${x + 100} ${centerY}, ${two.x} ${two.y}`, class: 'pot-signal-path', 'data-component-flow': 'volume' }, layers.components);
      addSvgText(x + 100, y + 169, '1 输入 · 2 输出 · 3 接地', 'confirmed-label');
    } else {
      const one = nodePositions['TONE.1'];
      const two = nodePositions['TONE.2'];
      addSvg('path', { d: `M ${one.x} ${one.y} Q ${x + 100} ${centerY}, ${two.x} ${two.y}`, class: 'tone-signal-component', 'data-component-flow': 'tone' }, layers.components);
      addSvgText(x + 100, y + 176, '1 输入 · 2 经电容接地 · 3 空置', 'confirmed-label');
    }
  };

  const createCapacitor = (x, y) => {
    createBox('CAP', x, y, 170, 100, '音色电容', '无极性');
    addSvg('line', { x1: x + 68, y1: y + 57, x2: x + 68, y2: y + 83, class: 'capacitor-plate' }, layers.components);
    addSvg('line', { x1: x + 102, y1: y + 57, x2: x + 102, y2: y + 83, class: 'capacitor-plate' }, layers.components);
    addSvg('path', { d: `M ${x + 72} ${y + 70} H ${x + 98}`, class: 'capacitor-field-path', 'data-component-flow': 'capacitor' }, layers.components);
    addSvg('line', { x1: x + 20, y1: y + 70, x2: x + 68, y2: y + 70, class: 'component-lead' }, layers.components);
    addSvg('line', { x1: x + 102, y1: y + 70, x2: x + 150, y2: y + 70, class: 'component-lead' }, layers.components);
    createTerminal('CAP.1', x + 20, y + 70, '1');
    createTerminal('CAP.2', x + 150, y + 70, '2');
    addSvgText(x + 85, y + 95, '总音色2 → 电容 → 公共地', 'confirmed-label');
  };

  const createJack = (x, y) => {
    createBox('JACK', x, y, 180, 120, '单声道输出插座', 'Tip 信号 / Sleeve 返回');
    addSvg('path', { d: `M ${x + 38} ${y + 82} H ${x + 88} L ${x + 122} ${y + 61}`, class: 'jack-contact' }, layers.components);
    addSvg('path', { d: `M ${x + 92} ${y + 92} H ${x + 142}`, class: 'jack-contact' }, layers.components);
    createTerminal('JACK.tip', x + 38, y + 82, 'Tip');
    createTerminal('JACK.sleeve', x + 142, y + 92, 'Sleeve');
    addSvgText(x + 140, y + 111, '返回公共地', 'confirmed-label');
  };

  const createExternalLoad = (x, y) => {
    createBox('LOAD', x, y, 180, 130, '外部音箱 / 声卡', '吉他线另一端的输入负载');
    createTerminal('LOAD.tip', x + 36, y + 82, 'Tip');
    createTerminal('LOAD.sleeve', x + 144, y + 82, 'Sleeve');
    addSvg('path', {
      d: `M ${x + 36} ${y + 82} H ${x + 54} l 9 -13 l 12 26 l 12 -26 l 12 26 l 9 -13 H ${x + 144}`,
      class: 'load-signal-path',
      'data-component-flow': 'load'
    }, layers.components);
    addSvgText(x + 90, y + 116, '外部负载闭合 Tip–Sleeve 回路', 'confirmed-label');
  };

  const createFourPdt = (x, y) => {
    createBox('D', x, y, 220, 390, '总串联 / 并联开关 D', '每行中间触点为公共触点');
    createInlineSwitch('D', x + 58, y + 51);
    const xs = [x + 50, x + 110, x + 170];
    const ys = [y + 120, y + 195, y + 270, y + 345];
    let number = 1;
    ys.forEach(rowY => xs.forEach(colX => createTerminal(`D.${number}`, colX, rowY, String(number++))));
  };

  const initializeDiagram = () => {
    createDpdt('A', 80, 90, '琴颈拾音器控制开关 A');
    createDpdt('B', 330, 90, '琴中拾音器控制开关 B');
    createDpdt('C', 580, 90, '琴桥拾音器控制开关 C');

    createDpdt('NP', 80, 410, '琴颈拾音器 Phase 开关');
    createDpdt('MP', 330, 410, '琴中拾音器 Phase 开关');
    createDpdt('BP', 580, 410, '琴桥拾音器 Phase 开关');

    createPickup('PNECK', 112, 700, '琴颈拾音器', pickupDefinitions[0].color);
    createPickup('PMIDDLE', 362, 700, '琴中拾音器', pickupDefinitions[1].color);
    createPickup('PBRIDGE', 612, 700, '琴桥拾音器', pickupDefinitions[2].color);

    createFourPdt(835, 250);
    createBox('GND', 895, 790, 120, 72, '公共信号地', '全电路基准');
    createTerminal('GND', 955, 825, '地');

    createPotentiometer('VOL', 1280, 60, '总音量电位器', false);
    createPotentiometer('TONE', 1280, 360, '总音色电位器', true);
    createCapacitor(1120, 565);
    createJack(1280, 710);
    createExternalLoad(1280, 900);

    addSvgText(430, 78, '上排：琴颈、琴中、琴桥拾音器控制开关 A / B / C', 'network-label');
    addSvgText(430, 398, '下排：琴颈、琴中、琴桥三个独立 Phase 开关', 'network-label');
    addSvgText(430, 687, '三个拾音器；A、B 为线圈两端，屏蔽线不进入 Phase 开关', 'network-label');
    addSvgText(945, 238, '总串联 / 并联', 'network-label');
    addSvgText(1295, 35, '音量、音色与输出级', 'network-label');
    addSvgText(1040, 142, 'NET-OUT：A5—B4—C3—C5—总音量1—总音色1', 'confirmed-network-label');
    svg.addEventListener('click', () => {
      clearDiagramFocus();
      renderDiagram(buildElectricalState());
      renderWireTable(buildElectricalState());
    });
  };

  const routeWire = (wire, index) => {
    const from = nodePositions[wire.from];
    const to = nodePositions[wire.to];
    if (!from || !to) return '';
    // Keep pickup leads outside the phase-switch boxes. A lead must never pass
    // through an unrelated lug, because that is visually indistinguishable
    // from a solder connection in a dense schematic.
    const pickupLeadLanes = {
      W01: 42, W02: 278,
      W03: 292, W04: 528,
      W05: 542, W06: 778
    };
    if (pickupLeadLanes[wire.id] !== undefined) {
      const laneX = pickupLeadLanes[wire.id];
      return `M ${from.x} ${from.y} H ${laneX} V ${to.y} H ${to.x}`;
    }
    const outputStageRoutes = {
      W29: `M ${from.x} ${from.y} H 795 V 215 H 1248 V ${to.y} H ${to.x}`,
      W34: `M ${from.x} ${from.y} H 1235 V ${to.y} H ${to.x}`,
      W35: `M ${from.x} ${from.y} H 810 V 330 H 1505 V ${to.y} H ${to.x}`,
      W36: `M ${from.x} ${from.y} H 1090 V ${to.y} H ${to.x}`,
      W37: `M ${from.x} ${from.y} H 1060 V 680 H 1530 V ${to.y} H ${to.x}`,
      W39: `M ${from.x} ${from.y} H 1542 V ${to.y} H ${to.x}`,
      W40: `M ${from.x} ${from.y} H 1040 V ${to.y} H ${to.x}`,
      W41: `M ${from.x} ${from.y} H 1180 V 850 H ${to.x} V ${to.y}`,
      W42: `M ${from.x} ${from.y} H 1245 V ${to.y} H ${to.x}`,
      W43: `M ${from.x} ${from.y} H 1518 V 875 H ${to.x} V ${to.y}`
    };
    if (outputStageRoutes[wire.id]) return outputStageRoutes[wire.id];
    const sameComponent = wire.from.split('.')[0] === wire.to.split('.')[0];
    if (sameComponent) {
      const direction = from.x < to.x ? -1 : 1;
      const outsideX = Math.min(from.x, to.x) - 22 - (index % 3) * 7 * direction;
      return `M ${from.x} ${from.y} H ${outsideX} V ${to.y} H ${to.x}`;
    }
    const distance = Math.abs(to.x - from.x);
    const laneShift = ((index % 7) - 3) * 8;
    const midX = from.x + (to.x - from.x) * (distance > 500 ? 0.62 : 0.5) + laneShift;
    return `M ${from.x} ${from.y} H ${midX} V ${to.y} H ${to.x}`;
  };

  const wireLabelPosition = (wire, from, to) => {
    const outputStageLabels = {
      W29: [1150, 209], W34: [1272, 674]
    };
    const position = outputStageLabels[wire.id];
    return position ? { x: position[0], y: position[1] } : { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - 5 };
  };

  const drawExternalWires = electrical => {
    layers.wires.innerHTML = '';
    wires.forEach((wire, index) => {
      const active = !electrical.hardGrounded && electrical.activeEdgeIds.has(`wire:${wire.id}`);
      const flowDirection = electrical.hardGrounded ? null : electrical.flowDirections.get(`wire:${wire.id}`);
      const flowRole = active ? electrical.flowRoles.get(`wire:${wire.id}`) : null;
      const hasFixedFocus = state.focusedWireIds instanceof Set;
      const hasAnyFocus = hasFixedFocus || Boolean(state.focusedNetwork);
      const focused = hasFixedFocus
        ? state.focusedWireIds.has(wire.id)
        : state.focusedNetwork === wire.network || state.selectedWire === wire.id;
      const inScope = wireInDiagramScope(wire, electrical);
      const dimmed = hasAnyFocus ? !focused : !inScope;
      const path = addSvg('path', {
        d: routeWire(wire, index),
        class: `external-wire${active ? ' active-path' : ''}${flowDirection ? ` flow-${flowDirection}` : ''}${flowRole ? ` flow-role-${flowRole}` : ''}${focused ? ' focused' : ''}${electrical.hardGrounded ? ' muted-state' : ''}${dimmed ? ' dimmed' : ''}`,
        'data-wire': wire.id,
        'data-network': wire.network
      }, layers.wires);
      path.style.setProperty('--route-color', networkColors[wire.network] || '#687780');
      path.addEventListener('click', event => {
        event.stopPropagation();
        focusFixedWireNetwork(wire.from, wire.id);
        renderDiagram(electrical);
        renderWireTable(electrical);
      });
      const from = nodePositions[wire.from];
      const to = nodePositions[wire.to];
      const labelPosition = wireLabelPosition(wire, from, to);
      const label = addSvgText(labelPosition.x, labelPosition.y, wire.id, `wire-id${active ? ' active-path' : ''}${flowRole ? ` flow-role-${flowRole}` : ''}${focused ? ' focused' : ''}${electrical.hardGrounded ? ' muted-state' : ''}${dimmed ? ' dimmed' : ''}`, layers.labels);
      label.style.setProperty('--route-color', networkColors[wire.network] || '#4a5861');
      label.dataset.wire = wire.id;
      label.addEventListener('click', event => {
        event.stopPropagation();
        focusFixedWireNetwork(wire.from, wire.id);
        renderDiagram(electrical);
        renderWireTable(electrical);
      });
    });
  };

  const drawInternalContacts = electrical => {
    layers.internal.innerHTML = '';
    const closedKeys = new Set(getInternalConnections().map(connection => connection.pair.slice().sort().join('|')));
    const allPairs = [];
    ['NP', 'MP', 'BP', 'A', 'B', 'C'].forEach(prefix => {
      [false, true].forEach(right => dpdtConnections(prefix, right).forEach(pair => allPairs.push({ pair, switchId: prefix })));
    });
    [
      ['D.1', 'D.2'], ['D.2', 'D.3'], ['D.4', 'D.5'], ['D.5', 'D.6'],
      ['D.7', 'D.8'], ['D.8', 'D.9'], ['D.10', 'D.11'], ['D.11', 'D.12']
    ].forEach(pair => allPairs.push({ pair, switchId: 'D' }));

    allPairs.forEach(({ pair, switchId }) => {
      const [fromId, toId] = pair;
      const from = nodePositions[fromId];
      const to = nodePositions[toId];
      const key = pair.slice().sort().join('|');
      const closed = closedKeys.has(key);
      const active = !electrical.hardGrounded && closed && electrical.activeEdgeIds.has(`contact:${key}`);
      const flowDirection = electrical.hardGrounded ? null : electrical.flowDirections.get(`contact:${key}`);
      const flowRole = active ? electrical.flowRoles.get(`contact:${key}`) : null;
      const relatedWires = wires.filter(wire => [wire.from, wire.to].includes(fromId) || [wire.from, wire.to].includes(toId));
      const relatedNetworks = new Set(relatedWires.map(wire => wire.network));
      const outputNetworks = new Set(['output', 'volume-input', 'volume-output', 'tone-feed', 'tone-capacitor', 'output-ground', 'ground', 'external-load', 'external-load-return']);
      const inScope = state.diagramScope === 'all'
        || (state.diagramScope === 'active' && active)
        || state.diagramScope === switchId
        || (state.diagramScope === 'output' && [...relatedNetworks].some(network => outputNetworks.has(network)));
      const focusedFixedTerminals = state.focusedTerminal
        ? fixedTerminalsByRoot.get(fixedWireUf.find(state.focusedTerminal)) || new Set()
        : null;
      const hasAnyFocus = Boolean(state.focusedNetwork) || Boolean(focusedFixedTerminals);
      const relatedToFocus = focusedFixedTerminals
        ? focusedFixedTerminals.has(fromId) || focusedFixedTerminals.has(toId)
        : relatedNetworks.has(state.focusedNetwork);
      const dimmed = hasAnyFocus ? !relatedToFocus : !inScope;
      addSvg('line', {
        x1: from.x, y1: from.y, x2: to.x, y2: to.y,
        class: `internal-contact ${closed ? 'closed' : 'open'}${active ? ' active-path' : ''}${flowDirection ? ` flow-${flowDirection}` : ''}${flowRole ? ` flow-role-${flowRole}` : ''}${electrical.hardGrounded ? ' muted-state' : ''}${dimmed ? ' dimmed' : ''}`
      }, layers.internal);
    });
  };

  const updateTerminalFocus = () => {
    const relatedTerminals = new Set();
    if (state.focusedTerminal) {
      const fixedTerminals = fixedTerminalsByRoot.get(fixedWireUf.find(state.focusedTerminal)) || new Set();
      fixedTerminals.forEach(terminal => relatedTerminals.add(terminal));
    } else if (state.focusedNetwork) {
      wires.filter(wire => wire.network === state.focusedNetwork).forEach(wire => {
        relatedTerminals.add(wire.from);
        relatedTerminals.add(wire.to);
      });
    }
    svg.querySelectorAll('[data-terminal]').forEach(circle => {
      const terminalId = circle.dataset.terminal;
      const componentId = terminalId.includes('.') ? terminalId.split('.')[0] : terminalId;
      const related = relatedTerminals.has(terminalId);
      const inScope = state.diagramScope === 'all'
        || state.diagramScope === 'active'
        || state.diagramScope === componentId
        || (state.diagramScope === 'output' && ['OUT', 'VOL', 'TONE', 'CAP', 'JACK', 'LOAD', 'GND'].includes(componentId));
      const hasAnyFocus = Boolean(state.focusedNetwork) || Boolean(state.focusedTerminal);
      circle.classList.toggle('focused', hasAnyFocus && related);
      circle.classList.toggle('dimmed', hasAnyFocus ? !related : !inScope);
    });
  };

  const wireInDiagramScope = (wire, electrical) => {
    if (state.diagramScope === 'all') return true;
    if (state.diagramScope === 'active') return electrical.activeEdgeIds.has(`wire:${wire.id}`);
    if (state.diagramScope === 'output') return ['output', 'volume-input', 'volume-output', 'tone-feed', 'tone-capacitor', 'output-ground', 'ground', 'external-load', 'external-load-return'].includes(wire.network);
    return wire.from.startsWith(`${state.diagramScope}.`) || wire.to.startsWith(`${state.diagramScope}.`);
  };

  const renderDiagram = electrical => {
    layers.labels.querySelectorAll('.wire-id').forEach(label => label.remove());
    drawExternalWires(electrical);
    drawInternalContacts(electrical);
    updateTerminalFocus();
    svg.classList.toggle('active-only-view', state.diagramScope === 'active');
    svg.classList.toggle('fixed-network-focus', Boolean(state.focusedTerminal));
    svg.querySelectorAll('[data-coil]').forEach(coil => {
      const active = !electrical.hardGrounded && electrical.activeEdgeIds.has(`coil:${coil.dataset.coil}`);
      const flowDirection = electrical.hardGrounded ? null : electrical.flowDirections.get(`coil:${coil.dataset.coil}`);
      const flowRole = active ? electrical.flowRoles.get(`coil:${coil.dataset.coil}`) : null;
      const pickup = pickupDefinitions.find(item => item.id === coil.dataset.coil);
      const inScope = state.diagramScope === 'all' || state.diagramScope === 'active' || state.diagramScope === pickup?.prefix;
      coil.classList.toggle('active-path', active);
      coil.classList.toggle('flow-forward', flowDirection === 'forward');
      coil.classList.toggle('flow-reverse', flowDirection === 'reverse');
      coil.classList.toggle('flow-role-pickup', flowRole === 'pickup');
      coil.classList.toggle('muted-state', electrical.hardGrounded);
      coil.classList.toggle('dimmed', Boolean(state.focusedNetwork) || !inScope);
    });
    svg.querySelectorAll('[data-component-flow]').forEach(component => {
      const edgeId = `component:${component.dataset.componentFlow}`;
      const active = !electrical.hardGrounded && electrical.activeEdgeIds.has(edgeId);
      const direction = electrical.hardGrounded ? null : electrical.flowDirections.get(edgeId);
      const flowRole = active ? electrical.flowRoles.get(edgeId) : null;
      component.classList.toggle('active-path', active);
      component.classList.toggle('flow-forward', direction === 'forward');
      component.classList.toggle('flow-reverse', direction === 'reverse');
      component.classList.toggle('flow-role-hot', flowRole === 'hot');
      component.classList.toggle('flow-role-ground', flowRole === 'ground');
      component.classList.toggle('muted-state', electrical.hardGrounded);
    });
    updateInlineSwitches();
    const clear = document.getElementById('clear-focus');
    clear.disabled = !state.focusedNetwork && !state.focusedTerminal;
    document.getElementById('diagram-scope').value = state.diagramScope;
    document.querySelectorAll('[data-diagram-view]').forEach(button => {
      const current = button.dataset.diagramView === 'current';
      button.setAttribute('aria-pressed', String(current ? state.diagramScope === 'active' : state.diagramScope !== 'active'));
    });
    const focusLabel = document.getElementById('diagram-focus-label');
    if (state.focusedTerminal) {
      const root = fixedWireUf.find(state.focusedTerminal);
      const ids = [...(fixedWireIdsByRoot.get(root) || [])].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
      const terminals = fixedTerminalsByRoot.get(root) || new Set();
      setLocalizedText(focusLabel, `${terminalDisplayName(state.focusedTerminal)} 所属的固定焊接网络：${ids.join('、')}；共 ${ids.length} 根线、${terminals.size} 个端点。`);
    } else if (state.focusedNetwork) {
      const network = networkById[state.focusedNetwork];
      const selected = wires.find(wire => wire.id === state.selectedWire);
      setLocalizedText(focusLabel, `${network ? network.label : state.focusedNetwork}${selected ? `；当前导线 ${selected.id}：${terminalDisplayName(selected.from)} → ${terminalDisplayName(selected.to)}` : ''}`);
    } else {
      const scopeLabels = {
        all: '全部线路', active: '当前完整回路', NP: '琴颈 Phase 开关', MP: '琴中 Phase 开关', BP: '琴桥 Phase 开关',
        A: '琴颈启用 / 旁路开关 A', B: '琴中启用 / 旁路开关 B', C: '琴桥启用 / 旁路开关 C', D: '总串联 / 并联开关 D', output: '矩阵输出总线'
      };
      setLocalizedText(focusLabel, `当前显示：${scopeLabels[state.diagramScope]}。点击任意导线或触点可以继续追踪单一网络。`);
    }
  };

  document.getElementById('clear-focus').addEventListener('click', () => {
    clearDiagramFocus();
    renderDiagram(buildElectricalState());
    renderWireTable(buildElectricalState());
  });

  document.getElementById('diagram-scope').addEventListener('change', event => {
    state.diagramScope = event.target.value;
    clearDiagramFocus();
    renderDiagram(buildElectricalState());
  });

  document.querySelectorAll('[data-diagram-view]').forEach(button => button.addEventListener('click', () => {
    state.diagramScope = button.dataset.diagramView === 'current' ? 'active' : 'all';
    clearDiagramFocus();
    renderDiagram(buildElectricalState());
  }));

  const renderContactCards = () => {
    const container = document.getElementById('contact-switches');
    container.innerHTML = '';
    const dpdts = [
      ...pickupDefinitions.map(pickup => ({ id: pickup.control, name: `${pickup.name}控制开关 ${pickup.control}`, right: !state.enabled[pickup.id], description: state.enabled[pickup.id] ? '图示左档：1–2、4–5 闭合' : '图示右档：2–3、5–6 闭合' })),
      ...pickupDefinitions.map(pickup => ({ id: pickup.prefix, name: `${pickup.name} Phase 开关`, right: state.reversed[pickup.id], description: state.reversed[pickup.id] ? '图示右档 / 位置2：2–3、5–6 闭合' : '图示左档 / 位置1：1–2、4–5 闭合' }))
    ];

    dpdts.forEach(item => {
      const card = createElement('article', 'contact-card');
      const header = createElement('div', 'contact-card-header');
      const titleWrap = createElement('div');
      titleWrap.append(createElement('h3', '', item.name), createElement('p', '', item.description));
      const goButton = createElement('button', 'secondary-button', '在总图中查看');
      goButton.type = 'button';
      goButton.addEventListener('click', () => {
        state.diagramScope = item.id;
        clearDiagramFocus();
        document.querySelector('[data-tab="simulation"]').click();
        renderDiagram(buildElectricalState());
      });
      header.append(titleWrap, goButton);
      card.appendChild(header);
      card.appendChild(createElement('div', 'dpdt-direction-note', '← 左档　拨杆沿页面左右移动　右档 →'));
      const diagram = createElement('div', 'contact-diagram numeric-dpdt-grid');
      const closedNumbers = new Set(item.right ? [2, 3, 5, 6] : [1, 2, 4, 5]);
      [3, 6, 2, 5, 1, 4].forEach(number => {
        const lug = createElement('div', `lug${[2, 5].includes(number) ? ' common' : ''}${closedNumbers.has(number) ? ' closed-lug' : ''}`, String(number));
        diagram.appendChild(lug);
      });
      card.appendChild(diagram);
      card.appendChild(createElement('div', 'contact-result', item.right ? '当前内部导通：2–3；5–6' : '当前内部导通：1–2；4–5'));
      container.appendChild(card);
    });

    const dCard = createElement('article', 'contact-card');
    const dHeader = createElement('div', 'contact-card-header');
    const dTitle = createElement('div');
    dTitle.append(createElement('h3', '', '总串联 / 并联开关 D'), createElement('p', '', state.mode === 'parallel' ? '并联档（左档）' : '串联档（右档）'));
    dHeader.appendChild(dTitle);
    dCard.appendChild(dHeader);
    const dGrid = createElement('div', 'four-pdt-grid');
    const closedDNumbers = new Set(state.mode === 'parallel' ? [1, 2, 4, 5, 7, 8, 10, 11] : [2, 3, 5, 6, 8, 9, 11, 12]);
    for (let number = 1; number <= 12; number += 1) {
      const lug = createElement('div', `lug${[2, 5, 8, 11].includes(number) ? ' common' : ''}`, String(number));
      lug.classList.toggle('closed-lug', closedDNumbers.has(number));
      dGrid.appendChild(lug);
    }
    dCard.appendChild(dGrid);
    dCard.appendChild(createElement('div', 'contact-result', state.mode === 'parallel'
      ? '当前内部导通：1–2；4–5；7–8；10–11'
      : '当前内部导通：2–3；5–6；8–9；11–12'));
    container.appendChild(dCard);

    [
      ['总音量电位器', 'VOL', '背面观察、触角朝下：从左到右为 1、2、3', [1, 2, 3]],
      ['总音色电位器', 'TONE', '背面观察、触角朝上：从左到右为 3、2、1', [3, 2, 1]]
    ].forEach(([title, id, description, order]) => {
      const potCard = createElement('article', 'contact-card');
      const potHeader = createElement('div', 'contact-card-header');
      const potTitle = createElement('div');
      potTitle.append(createElement('h3', '', title), createElement('p', '', description));
      potHeader.appendChild(potTitle);
      potCard.appendChild(potHeader);
      const lugs = createElement('div', 'pot-contact-row');
      order.forEach(number => lugs.appendChild(createElement('div', `lug${number === 2 ? ' wiper' : ''}`, String(number))));
      potCard.appendChild(lugs);
      const connectionSummary = id === 'VOL'
        ? '当前连接：1 号接矩阵输出，2 号接 Tip，3 号接公共地。'
        : '当前连接：1 号接矩阵输出，2 号经音色电容接公共地，3 号空置。';
      potCard.appendChild(createElement('div', 'contact-result', `${connectionSummary} 实物仍要用万用表确认滑动端和旋转方向。`));
      container.appendChild(potCard);
    });
  };

  const wireFilterDefinitions = [
    ['all', '主体矩阵与输出回路的 43 段导线'], ['neck', '琴颈拾音器部分'], ['middle', '琴中拾音器部分'],
    ['bridge', '琴桥拾音器部分'], ['routing', '主体总路由'], ['ground', '主体公共信号地'],
    ['output', 'NET-OUT 主体总线'], ['output-stage', '总音量、总音色、电容、Tip / Sleeve 与外部负载']
  ];

  const initializeWireFilters = () => {
    const container = document.getElementById('wire-filters');
    wireFilterDefinitions.forEach(([id, label]) => {
      const button = createElement('button', '', label);
      button.type = 'button';
      button.dataset.wireFilter = id;
      button.addEventListener('click', () => {
        state.wireFilter = id;
        state.selectedWire = null;
        renderWireTable(buildElectricalState());
      });
      container.appendChild(button);
    });
    document.getElementById('print-wiring').addEventListener('click', () => window.print());
  };

  const initializeNetworkColorLegend = () => {
    const container = document.getElementById('network-color-legend');
    Object.entries(networkById).forEach(([networkId, network]) => {
      const item = createElement('div', 'network-color-item');
      const swatch = createElement('i', 'network-color-swatch');
      swatch.style.setProperty('--route-color', networkColors[networkId] || '#687780');
      item.append(swatch, createElement('span', '', network.label));
      container.appendChild(item);
    });
  };

  const renderWireTable = electrical => {
    document.querySelectorAll('[data-wire-filter]').forEach(button => button.classList.toggle('active', button.dataset.wireFilter === state.wireFilter));
    const visible = state.wireFilter === 'all' ? wires : wires.filter(wire => wire.group === state.wireFilter);
    const body = document.getElementById('wire-table-body');
    body.innerHTML = '';
    visible.forEach(wire => {
      const active = electrical.activeEdgeIds.has(`wire:${wire.id}`);
      const row = document.createElement('tr');
      row.classList.toggle('selected', wire.id === state.selectedWire);
      const numberCell = createElement('td');
      const number = createElement('span', 'wire-number', wire.id);
      number.style.setProperty('--route-color', networkColors[wire.network] || '#687780');
      numberCell.appendChild(number);
      row.appendChild(numberCell);
      [terminalDisplayName(wire.from), terminalDisplayName(wire.to), networkById[wire.network]?.label || wire.network].forEach(value => row.appendChild(createElement('td', '', value)));
      const reported = reportedCompletedWires.includes(wire.id);
      const stateText = `${reported ? '用户报告已焊；' : ''}${active ? '连接在当前信号路径上' : '当前不在有效信号路径上'}`;
      row.appendChild(createElement('td', active ? 'wire-state-active' : 'wire-state-idle', stateText));
      row.addEventListener('click', () => {
        focusFixedWireNetwork(wire.from, wire.id);
        renderWireTable(electrical);
        renderDiagram(electrical);
      });
      body.appendChild(row);
    });

    const detail = document.getElementById('wire-detail');
    detail.innerHTML = '';
    const selected = wires.find(wire => wire.id === state.selectedWire);
    if (!selected) {
      detail.className = 'wire-detail empty';
      setLocalizedText(detail, '点击清单中的一根导线，查看它的首端点、尾端点和当前作用。');
      return;
    }
    detail.className = 'wire-detail';
    detail.appendChild(createElement('h3', '', `${selected.id} · ${selected.label}`));
    const endpoints = createElement('div', 'wire-endpoints');
    endpoints.append(createElement('span', 'wire-endpoint', `首端：${terminalDisplayName(selected.from)}`), createElement('span', 'path-arrow', '→'), createElement('span', 'wire-endpoint', `尾端：${terminalDisplayName(selected.to)}`));
    detail.appendChild(endpoints);
    const active = electrical.activeEdgeIds.has(`wire:${selected.id}`);
    const reportedText = reportedCompletedWires.includes(selected.id) ? '你报告这段实物线路已经焊接完成。' : '';
    detail.appendChild(createElement('p', 'small-note', `${reportedText}${active ? '在当前开关组合中，这根线连接在有效信号路径上。' : '在当前开关组合中，这根线不属于有效信号路径；它仍然是主体矩阵的固定导线。'}`));
  };

  const renderWeldingDemo = () => {
    const container = document.getElementById('welding-diagram');
    container.innerHTML = '';
    const clone = svg.cloneNode(true);
    clone.id = 'welding-circuit-svg';
    clone.classList.add('welding-circuit-svg');
    clone.removeAttribute('aria-labelledby');
    clone.setAttribute('aria-label', localize(`焊接演示，已经加入 ${state.weldedWires.length} 根外部导线`));
    clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    clone.querySelectorAll('.internal-contact').forEach(element => element.remove());
    clone.querySelectorAll('.inline-switch').forEach(element => element.remove());
    clone.querySelectorAll('.external-wire, .wire-id').forEach(element => {
      if (!state.weldedWires.includes(element.dataset.wire)) element.remove();
    });
    clone.querySelectorAll('.active-path, .focused, .dimmed, .flow-forward, .flow-reverse').forEach(element => {
      element.classList.remove('active-path', 'focused', 'dimmed', 'flow-forward', 'flow-reverse');
    });

    const nextId = weldingOrder.find(wireId => !state.weldedWires.includes(wireId));
    const nextWire = wires.find(wire => wire.id === nextId);
    if (nextWire) {
      [nextWire.from, nextWire.to].forEach(terminal => {
        clone.querySelector(`[data-terminal="${terminal}"]`)?.classList.add('welding-next-terminal');
      });
    }
    container.appendChild(clone);

    const completed = state.weldedWires.length;
    const total = weldingOrder.length;
    setLocalizedText(document.getElementById('welding-progress-text'), `${completed} / ${total} 根`);
    document.getElementById('welding-progress-bar').style.width = `${completed / total * 100}%`;
    document.getElementById('welding-undo').disabled = completed === 0;
    const addButton = document.getElementById('welding-add');
    addButton.disabled = completed === total;

    const title = document.getElementById('next-wire-title');
    const endpoints = document.getElementById('next-wire-endpoints');
    const reason = document.getElementById('next-wire-reason');
    endpoints.innerHTML = '';
    if (nextWire) {
      setLocalizedText(title, `${nextWire.id} · ${nextWire.label}`);
      endpoints.append(
        createElement('span', 'wire-endpoint', `首端：${terminalDisplayName(nextWire.from)}`),
        createElement('span', 'path-arrow', '→'),
        createElement('span', 'wire-endpoint', `尾端：${terminalDisplayName(nextWire.to)}`)
      );
      setLocalizedText(reason, weldingReason(nextWire.id));
      setLocalizedText(addButton, `加入 ${nextWire.id}`);
    } else {
      setLocalizedText(title, `${total} 根已确认固定导线已经全部加入`);
      endpoints.appendChild(createElement('span', 'welding-complete-message', '下一步：逐项做导通、短路和实物脚位复核。'));
      setLocalizedText(reason, '演示完成不等于已经可以直接焊接；必须先完成“实物确认”页的万用表测量。');
      setLocalizedText(addButton, '演示已完成');
    }

    const list = document.getElementById('welding-completed-list');
    list.innerHTML = '';
    state.weldedWires.forEach(wireId => {
      const wire = wires.find(item => item.id === wireId);
      const item = createElement('li');
      const swatch = createElement('i', 'welding-wire-swatch');
      swatch.style.setProperty('--route-color', networkColors[wire.network] || '#687780');
      item.append(swatch, createElement('span', '', `${wire.id}：${terminalDisplayName(wire.from)} → ${terminalDisplayName(wire.to)}`));
      list.appendChild(item);
    });
  };

  const initializeWeldingDemo = () => {
    document.getElementById('welding-add').addEventListener('click', () => {
      const next = weldingOrder.find(wireId => !state.weldedWires.includes(wireId));
      if (next) state.weldedWires.push(next);
      renderWeldingDemo();
    });
    document.getElementById('welding-undo').addEventListener('click', () => {
      state.weldedWires.pop();
      renderWeldingDemo();
    });
    document.getElementById('welding-reset').addEventListener('click', () => {
      state.weldedWires = [];
      renderWeldingDemo();
    });
    document.getElementById('welding-load-current').addEventListener('click', () => {
      state.weldedWires = weldingOrder.filter(wireId => reportedCompletedWires.includes(wireId));
      renderWeldingDemo();
    });
  };

  const measurementDefinitions = [
    { id: 'dpdt-np', title: '琴颈 Phase 开关', detail: '确认一个位置为 1–2、4–5；另一个位置为 2–3、5–6。' },
    { id: 'dpdt-mp', title: '琴中 Phase 开关', detail: '独立测量，不能仅假定与另一只同向。' },
    { id: 'dpdt-bp', title: '琴桥 Phase 开关', detail: '独立测量并在实物背面贴触点标签。' },
    { id: 'dpdt-a', title: '琴颈启用 / 旁路开关 A', detail: '记录拨杆方向与背面焊脚方向。' },
    { id: 'dpdt-b', title: '琴中启用 / 旁路开关 B', detail: '确认两组公共触点都是中间焊脚。' },
    { id: 'dpdt-c', title: '琴桥启用 / 旁路开关 C', detail: '按老师图逆时针旋转后的方向标记：上行 3、6，中行 2、5，下行 1、4；确认 2、5 是公共触点，拨杆沿页面左右方向操作。' },
    { id: 'four-pdt', title: '总串联 / 并联开关 D', detail: '逐行确认 1–2 / 2–3、4–5 / 5–6、7–8 / 8–9、10–11 / 11–12。' },
    { id: 'pickup-neck', title: '琴颈拾音器导线', detail: '找出线圈两端、屏蔽线，并记录直流电阻。' },
    { id: 'pickup-middle', title: '琴中拾音器导线', detail: '不要只凭导线颜色判断 A 端、B 端和屏蔽。' },
    { id: 'pickup-bridge', title: '琴桥拾音器导线', detail: '记录线圈两端阻值以及与金属底板的关系。' },
    { id: 'pots', title: '两个电位器', detail: '测量总阻值、旋转方向和中间滑动端；复核总音量1是输入、2是 Tip 输出、3是公共地。' },
    { id: 'jack', title: '单声道输出插座', detail: '插入插头后确认 Tip 信号触点和 Sleeve 接地触点。' },
    { id: 'capacitor', title: '音色电容', detail: '清晰抄录完整字样；有电容表则同时测量。' }
  ];

  const loadMeasurements = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (_) { return {}; }
  };

  const saveMeasurements = values => localStorage.setItem(STORAGE_KEY, JSON.stringify(values));

  const initializeMeasurements = () => {
    const values = loadMeasurements();
    const container = document.getElementById('measurement-list');
    measurementDefinitions.forEach(item => {
      const label = createElement('label', 'measurement-item');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(values[item.id]);
      checkbox.dataset.measurement = item.id;
      const text = createElement('span');
      text.append(createElement('strong', '', item.title), createElement('span', '', item.detail));
      label.append(checkbox, text);
      container.appendChild(label);
      checkbox.addEventListener('change', persistMeasurements);
    });
    ['capacitor-marking', 'volume-resistance', 'tone-resistance', 'jack-confirmation'].forEach(id => {
      const field = document.getElementById(id);
      field.value = values[id] || '';
      field.addEventListener('input', persistMeasurements);
      field.addEventListener('change', persistMeasurements);
    });
    document.getElementById('clear-measurements').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      document.querySelectorAll('[data-measurement]').forEach(input => { input.checked = false; });
      ['capacitor-marking', 'volume-resistance', 'tone-resistance', 'jack-confirmation'].forEach(id => { document.getElementById(id).value = ''; });
      updateReleaseGate();
    });
    updateReleaseGate();
  };

  const persistMeasurements = () => {
    const values = {};
    document.querySelectorAll('[data-measurement]').forEach(input => { values[input.dataset.measurement] = input.checked; });
    ['capacitor-marking', 'volume-resistance', 'tone-resistance', 'jack-confirmation'].forEach(id => { values[id] = document.getElementById(id).value; });
    saveMeasurements(values);
    updateReleaseGate();
  };

  const updateReleaseGate = () => {
    const checked = [...document.querySelectorAll('[data-measurement]')].filter(input => input.checked).length;
    const fieldsReady = Boolean(
      document.getElementById('capacitor-marking').value.trim()
      && Number(document.getElementById('volume-resistance').value) > 0
      && Number(document.getElementById('tone-resistance').value) > 0
      && document.getElementById('jack-confirmation').value === 'confirmed'
    );
    const complete = checked === measurementDefinitions.length && fieldsReady;
    const gate = document.querySelector('.release-gate');
    gate.classList.toggle('ready', complete);
    setLocalizedText(document.getElementById('gate-icon'), complete ? '✓' : '!');
    setLocalizedText(document.getElementById('gate-title'), complete ? '测量资料齐全，等待生成最终焊接版' : '尚未放行');
    setLocalizedText(document.getElementById('gate-description'), complete
      ? '实物映射项目已经登记完整。下一步需把测量结果写入最终触点图，并补齐音量、音色和输出插座线路后才能开始焊接。'
      : `已完成 ${checked} / ${measurementDefinitions.length} 项元件测量。未完成前，页面中的端点名称不能直接对应真实金属焊脚。`);
  };

  const initializePhotoDialog = () => {
    const dialog = document.getElementById('photo-dialog');
    document.getElementById('photo-open').addEventListener('click', () => dialog.showModal());
    document.getElementById('photo-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  };

  const validateInteractiveModel = () => {
    const saved = {
      mode: state.mode,
      enabled: { ...state.enabled },
      reversed: { ...state.reversed }
    };
    const failures = [];
    const testNumbers = new Set();
    ['parallel', 'series'].forEach(mode => {
      for (let enabledMask = 0; enabledMask < 8; enabledMask += 1) {
        for (let phaseMask = 0; phaseMask < 8; phaseMask += 1) {
          state.mode = mode;
          pickupDefinitions.forEach((pickup, index) => {
            state.enabled[pickup.id] = Boolean(enabledMask & (1 << index));
            state.reversed[pickup.id] = Boolean(phaseMask & (1 << index));
          });
          const electrical = buildElectricalState();
          const enabledIds = pickupDefinitions.filter(pickup => state.enabled[pickup.id]).map(pickup => pickup.id).sort();
          const usedIds = pickupDefinitions.filter(pickup => electrical.pickupStatus[pickup.id].used).map(pickup => pickup.id).sort();
          const expectedPathCount = enabledIds.length === 0 ? 0 : mode === 'parallel' ? enabledIds.length : 1;
          const test = getCurrentTest();
          testNumbers.add(test.number);
          if ((enabledIds.length === 0) !== electrical.hardGrounded) failures.push(`静音判断错误：${mode}/${enabledMask}/${phaseMask}`);
          if (electrical.paths.length !== expectedPathCount) failures.push(`路径数错误：${mode}/${enabledMask}/${phaseMask}`);
          if (enabledIds.join('|') !== usedIds.join('|')) failures.push(`拾音器成员错误：${mode}/${enabledMask}/${phaseMask}`);
          const leadWires = {
            neck: ['wire:W01', 'wire:W02'],
            middle: ['wire:W03', 'wire:W04'],
            bridge: ['wire:W05', 'wire:W06']
          };
          pickupDefinitions.forEach(pickup => {
            const id = pickup.id;
            const leadsActive = leadWires[id].every(edgeId => electrical.activeEdgeIds.has(edgeId));
            if (state.enabled[id] !== leadsActive && !electrical.hardGrounded) {
              failures.push(`拾音器两端线高亮错误：${mode}/${enabledMask}/${phaseMask}/${id}`);
            }
          });
          enabledIds.forEach(id => {
            if (!electrical.activeEdgeIds.has(`coil:${id}`)) {
              failures.push(`线圈未进入高亮回路：${mode}/${enabledMask}/${phaseMask}/${id}`);
            }
          });
          if (!electrical.hardGrounded) {
            electrical.activeEdgeIds.forEach(edgeId => {
              if ((edgeId.startsWith('wire:') || edgeId.startsWith('contact:')) && !electrical.flowRoles.has(edgeId)) {
                failures.push(`有效线路缺少输出/地端颜色：${mode}/${enabledMask}/${phaseMask}/${edgeId}`);
              }
            });
          }
        }
      }
    });
    state.mode = saved.mode;
    state.enabled = saved.enabled;
    state.reversed = saved.reversed;
    if (testNumbers.size !== 128) failures.push(`测试编号只覆盖 ${testNumbers.size}/128`);
    const status = document.getElementById('model-status');
    status.classList.toggle('verified', failures.length === 0);
    status.classList.toggle('error', failures.length > 0);
    setLocalizedText(status, failures.length === 0
      ? '互动模型：128 种状态自检通过'
      : `互动模型错误：${failures.length} 项`);
    if (failures.length) console.error('互动电路模型自检失败', failures);
    return failures;
  };

  const renderAll = () => {
    updateControlStates();
    const electrical = buildElectricalState();
    renderStateSummary(electrical);
    renderDiagram(electrical);
    renderContactCards();
    renderWireTable(electrical);
    renderWeldingDemo();
  };

  captureStaticContent();
  applyStaticLanguage();
  document.getElementById('language-toggle')?.addEventListener('click', () => {
    state.language = state.language === 'en' ? 'zh' : 'en';
    localStorage.setItem(LANGUAGE_KEY, state.language);
    applyStaticLanguage();
    refreshDynamicLanguage();
    renderAll();
    renderContactCards();
    renderWireTable(buildElectricalState());
    renderWeldingDemo();
    updateReleaseGate();
  });

  initializeTabs();
  initializeControls();
  initializeDiagram();
  initializeWireFilters();
  initializeNetworkColorLegend();
  initializeWeldingDemo();
  initializeMeasurements();
  initializePhotoDialog();
  validateInteractiveModel();
  renderAll();
})();
