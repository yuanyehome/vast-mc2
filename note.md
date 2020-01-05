- 画出时间序列图，回答问题一
- 方位角风向差异图，回答问题三
- TimeCurves尝试
- 等高线图插值
- t-SNE投影

关键信息提取：
- 四个公司和九个传感器位置
- 四个公司基本特征：
    - Roadrunner Fitness Electronics：电子产品
    - Kasios Office Furniture：家具（木材）
    - Radiance ColourTek：有机化合物，涂料，溶剂
    - Indigo Sol Boards：玻璃纤维滑雪板
- 四种污染物基本特征：
    - Appluimonia：异味
    - Chlorodinine：它已被用作消毒剂和灭菌剂以及其他用途
    - Methylosmolene：挥发性有机溶剂
    - AGOC-3A：这些新溶剂（包括AGOC-3A）对人体和环境健康的危害较小

思路：
- 热力图：以传感器类型和污染物类型做刷选
- 方位角风向差异折线图
- 观测点污染物数值折线图
- 布局：
    - 左上角：热力图，根据月份，化学物质，传感器做刷选
    - 右上角：等高线图，根据左边点击的日期绘制
    - 下面：折线图，方位角折线图根据选择的传感器确定；观测点污染物数值折线图根据陈爨感其和污染物决定