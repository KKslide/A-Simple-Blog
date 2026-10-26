<template>
  <div class="case-detail-container hzy-detail-wrapper">
    <el-descriptions
      class="margin-top"
      title="案件录入"
      :column="2"
      border
    >
      <template v-if="caseType === 'exceedance' || caseType === 'offline'">
        <el-descriptions-item label="案件开始时间">{{ formattedCaseDate }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ updateVal(listcase.company_name) }}</el-descriptions-item>
        <el-descriptions-item label="区域">{{ updateVal(listcase.areaname) }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ updateVal(listcase.address) }}</el-descriptions-item>
        <el-descriptions-item label="企业联系人">{{ updateVal(listcase.contacts) }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ updateVal(listcase.phone) }}</el-descriptions-item>
        <el-descriptions-item label="街道责任人">{{ updateVal(listcase.contacts_daily) }}</el-descriptions-item>
        <el-descriptions-item label="责任人电话">{{ updateVal(listcase.phone_daily) }}</el-descriptions-item>
        <el-descriptions-item label="生成原因" :span="2">{{ caseGenerationReason }}</el-descriptions-item>
        <el-descriptions-item :label="caseDateDetailName" :span="2">{{ caseDateDetailValue }}</el-descriptions-item>
      </template>

      <template v-else-if="caseType === 'complaint'">
        <el-descriptions-item label="点位名称">{{ updateVal(listcase.door_name) }}</el-descriptions-item>
        <el-descriptions-item label="对应商铺名称">{{ updateVal(listcase.store_name) }}</el-descriptions-item>
        <el-descriptions-item label="区域">{{ updateVal(listcase.areaname) }}</el-descriptions-item>
        <el-descriptions-item label="签收日期">{{ myCreateDate(listcase.signfor_time) }}</el-descriptions-item>
        <el-descriptions-item label="问题类型" :span="2">{{ complaintTypes }}</el-descriptions-item>
        <el-descriptions-item label="诉求内容" :span="2">{{ updateVal(listcase.complaint_txt) }}</el-descriptions-item>
      </template>
    </el-descriptions>

    <div v-for="item in historyList" :key="item._id" class="history-card">
      <el-descriptions
        :column="2"
        border
      >
        <template #header>
          <p v-html="getHistoryTitle(item)"></p>
        </template>
        <el-descriptions-item label="流程开始时间">{{ updateVal(item.bt) }}</el-descriptions-item>
        <el-descriptions-item label="流程结束时间">{{ updateVal(item.et) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.contacts_daily" label="街道责任人">{{ updateVal(item.contacts_daily) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.phone_daily" label="责任人电话">{{ updateVal(item.phone_daily) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.hc_contacts" label="街道核查人">{{ updateVal(item.hc_contacts) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.hc_phone" label="核查人电话">{{ updateVal(item.hc_phone) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.three_contacts" label="第三方公司人员">{{ updateVal(item.three_contacts) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.three_phone" label="第三方电话">{{ updateVal(item.three_phone) }}</el-descriptions-item>

        <el-descriptions-item v-if="item.cbReason" label="超标原因" :span="2">{{ item.cbReason }}</el-descriptions-item>
        <el-descriptions-item v-if="item.lx_type" label="离线原因" :span="2">{{ getLxType(item.lx_type) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.lx_cs" label="整改措施" :span="2">{{ getOfflineRectificationMeasure(item) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.hc_rs_type" label="问题是否属实">{{ getHcRsType(item.hc_rs_type) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.is_address" label="地址是否一致">{{ isOK(item.is_address) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.hc_problem" label="现场问题描述" :span="2">{{ updateVal(item.hc_problem) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.hc_suggest" label="整改建议" :span="2">{{ updateVal(item.hc_suggest) }}</el-descriptions-item>
        <el-descriptions-item v-if="item.case_result" label="整改结果" :span="2">{{ getCaseResult(item.case_result) }}</el-descriptions-item>

        <el-descriptions-item v-if="extractImages(item).length > 0" label="现场照片" :span="2">
            <div class="image-gallery">
              <div v-for="(img, index) in extractImages(item)" :key="index" class="image-container">
                <el-image
                  style="width: 150px; height: 150px"
                  :src="IMG_DOMAIN + img.url"
                  :preview-src-list="[IMG_DOMAIN + img.url]"
                  fit="contain"
                  hide-on-click-modal
                />
                <p class="image-caption">{{ img.caption }}</p>
              </div>
            </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-if="isCaseClosed" class="case-closure-card">
        <el-descriptions
            title="结案"
            :column="2"
            border
        >
            <el-descriptions-item label="案件创建时间">{{ caseCreateTime }}</el-descriptions-item>
            <el-descriptions-item label="案件结束时间">{{ caseFinishTime }}</el-descriptions-item>
            <el-descriptions-item label="案件结果" :span="2">{{ caseResultText }}</el-descriptions-item>
            <el-descriptions-item v-if="caseRemark" label="结案备注" :span="2">{{ caseRemark }}</el-descriptions-item>
        </el-descriptions>
    </div>

  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { getMoreDay3 } from '@/api/hengzhiyuan'
import { ref, onMounted, computed, watch } from 'vue'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
const IMG_DOMAIN = import.meta.env.VITE_IMG_DOMAIN
const dialogStore = useDialogStore()
// ================== 响应式数据和计算属性 ==================
const caseData = ref({})
// 从 props 数据中派生出各个部分，方便模板使用
const listcase = computed(() => caseData.value.listcase || {});
const historyList = computed(() => caseData.value.list || []);
const caseRs = computed(() => caseData.value.caseRs || {});
const exceedanceDates = ref(''); // 用于异步获取超标日期，初始为空

// 计算属性：判断案件类型，简化模板中的v-if逻辑
const caseType = computed(() => {
  const type = listcase.value.case_type;
  if (type === 1 || type === '1') return 'exceedance'; // 超标
  if (type === 4 || type === '4') return 'offline';    // 离线
  if (listcase.value.lz_id) return 'complaint';      // 投诉 (根据lz_id字段判断)
  return 'unknown';
});

// 计算属性：格式化案件开始时间
const formattedCaseDate = computed(() => updateVal(listcase.value.date));

// 计算属性：动态生成案件原因描述
const caseGenerationReason = computed(() => {
  const cday = listcase.value.case_cday;
  if (caseType.value === 'exceedance') {
    return `油烟浓度连续 ${cday} 天超标`;
  }
  if (caseType.value === 'offline') {
    return `设备连续 ${cday} 天离线`;
  }
  return '';
});

// 计算属性：动态生成日期详情的标签名
const caseDateDetailName = computed(() => {
  if (caseType.value === 'exceedance') return '超标日期及浓度';
  if (caseType.value === 'offline') return '离线日期';
  return '';
});

// 计算属性：动态生成日期详情的值
const caseDateDetailValue = computed(() => {
  if (caseType.value === 'exceedance') {
    // 对于超标类型，值来自于异步获取的 exceedanceDates
    return exceedanceDates.value || '加载中...';
  }
  if (caseType.value === 'offline') {
    // 对于离线类型，值是同步计算出来的
    return getOfflineDates(listcase.value.case_cday, myCreateDate(listcase.value.create_time));
  }
  return '';
});

// 计算属性：格式化投诉类型文本
const complaintTypes = computed(() => {
    return setComplaintType(listcase.value.complaint_type);
});

// 计算属性：判断案件是否已结案
const isCaseClosed = computed(() => {
    return caseRs.value.his_type === 10 || listcase.value.case_status === 3;
});

// 计算属性：获取结案创建时间
const caseCreateTime = computed(() => {
    if (caseType.value === 'complaint') {
        return myCreateDate(listcase.value.create_time);
    }
    return caseRs.value.create_time || '';
});

// 计算属性：获取结案完成时间
const caseFinishTime = computed(() => {
    if (caseType.value === 'complaint') {
        return myCreateDate(listcase.value.finist_time);
    }
    return caseRs.value.finist_time || '';
});

// 计算属性：获取结案结果的文本
const caseResultText = computed(() => {
    const result = listcase.value.case_result;
    if (caseType.value === 'complaint') {
        return getCaseResult(result);
    }
    return getClosedCaseStatus(result);
});

// 计算属性：处理结案备注的复杂逻辑
const caseRemark = computed(() => {
    // 超标/离线案件的备注逻辑
    if (caseType.value === 'exceedance' || caseType.value === 'offline') {
        const isAuto = ['1', 1, '2', 2].includes(listcase.value.case_isauto);
        if (isAuto) {
            return listcase.value.case_remark;
        }
        if (caseType.value === 'exceedance') {
            return "从现场整改提交后，到结案，没有油烟浓度超标数据，整改合格";
        }
        if (caseType.value === 'offline') {
            return "从现场核查提交后，到结案，监控设备数据已经恢复正常，整改合格";
        }
    }
    // 投訴案件的备注
    return updateVal(listcase.value.case_remark);
});

// ================== 方法和逻辑 ==================
onMounted(() => {
  dialogStore.getDetail()
})
watch(
  () => dialogStore.subDetailData,
  nv => {
    caseData.value = nv
    // 如果是超标案件，则触发异步数据获取
    if (caseType.value === 'exceedance') {
      fetchExceedanceDates(listcase.value);
    }
  },
  { deep: true }
)

// 工具函数：安全地获取值，防止 undefined 或 null 导致页面渲染错误
const updateVal = (_val) => {
  if (_val === null || _val === undefined || _val === "undefined") {
    return "";
  }
  return _val;
};

// 工具函数：将Unix时间戳 (秒) 转换为 'YYYY-MM-DD' 格式的字符串
const myCreateDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const y = date.getFullYear();
  let m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  let d = date.getDate();
  d = d < 10 ? '0' + d : d;
  return `${y}-${m}-${d}`;
};

// --- 数据格式化与对应表 ---

// 获取历史流程的标题
const getHistoryTitle = (item) => {
    const titleMap = {
        2: '现场核查',
        3: '现场整改 / 跟进处理',
        4: '跟进处理'
    };
    let title = titleMap[item.his_type] || '未知流程';
    // 如果流程被驳回，添加特殊样式
    if (item.his_status === 3) {
        title += '-<span style="color: #f00;">驳回</span>';
    }
    return title;
};

// 判断是否为 "是"
const isOK = (_val) => ([1, '1'].includes(_val) ? '是' : '否');

// 获取问题核实结果文本
const getHcRsType = (v) => {
    const map = { '1': '否', '2': '是', '3': '问题重复，已处理', '4': '无效投诉' };
    return map[v] || '';
};

// 获取整改结果文本
const getCaseResult = (rs) => {
    const map = { '1': '全部整改完毕', '2': '未完成，继续整改' };
    return map[rs] || '';
};

// 获取结案状态文本
const getClosedCaseStatus = (rs) => {
    const map = { '1': '合格', '2': '不合格' };
    return map[rs] || '';
};

// 获取离线原因文本
const getLxType = (rs) => {
    const map = {
        '1': '暂停营业', '2': '结业', '3': '设备故障',
        '4': '监控设备未正常供电', '5': '监控设备与净化器联动，未正常使用净化设备', '6': '其他原因'
    };
    return map[rs] || '';
};

// 获取离线案件的整改措施
const getOfflineRectificationMeasure = (item) => {
    // 如果是其他原因，则显示自定义文本
    if (item.lx_type == '6') {
        return item.lx_cs_qt;
    }
    const map = {
        '1': '待商家恢复营业', '2': '拆除设备', '3': '维修监控设备',
        '4': '督促商家正常使用监控设备', '5': '督促商家正常使用净化设备'
    };
    return map[item.lx_cs] || '';
};

// 格式化投诉类型，将代码数组转换为可读字符串
const setComplaintType = (types) => {
    if (!types) return '';
    const typeMap = {
        '1': '油烟问题(油烟、颗粒物、非甲烷总烃)', '2': '异味问题', '3': '噪声问题',
        '4': '越门经营问题', '5': '乱扔乱倒垃圾问题', '6': '乱倒乱排污油污水问题', '7': '其他问题',
    };
    return types.split(',')
        .map(t => typeMap[t])
        .filter(Boolean) // 过滤掉无效的type
        .join(', ');
};

// 从历史记录项中提取所有图片信息，并附上标题
const extractImages = (item) => {
    const images = [];
    // 定义图片key和对应标题的映射关系
    const captionMap = {
        imgurl_1: caseType.value === 'complaint' ? '现场照片' : '核查人照片',
        imgurl_2: caseType.value === 'complaint' ? '现场照片' : '集烟罩',
        imgurl_3: caseType.value === 'complaint' ? '现场照片' : '净化器',
        imgurl_4: caseType.value === 'complaint' ? '现场照片' : '除味器',
        imgurl_5: '消声器',
        imgurl_6: '在线监控仪',
        imgurl_7: '清洗合同',
    };

    for (const key in captionMap) {
        // 如果item中存在该图片url，则添加到数组
        if (item[key]) {
            images.push({ url: item[key], caption: captionMap[key] });
        }
    }
    return images;
};

// --- 异步数据模拟 ---

// 模拟调用 getMoreDay3 API
// const mockGetMoreDay3 = async (params) => {
//     console.log('模拟API调用 getMoreDay3，参数:', params);
//     // 模拟网络延迟
//     await new Promise(resolve => setTimeout(resolve, 500));
//     // 使用题目中提供的示例数据作为返回值
//     return {
//         "code": 2000,
//         "list": [
//             { "ctime": 1755619200, "max": 2.09 },
//             { "ctime": 1755705600, "max": 2.45 },
//             { "ctime": 1755792000, "max": 2.3 }
//         ]
//     };
// };

// 异步获取超标日期数据
async function fetchExceedanceDates(caseInfo) {
    if (!caseInfo.company_ref_id) {
        exceedanceDates.value = '缺少必要的查询参数';
        return;
    }
    try {
        const res = await getMoreDay3({
            company_ref_id: caseInfo.company_ref_id,
            case_cday: caseInfo.case_cday,
            create_time: myCreateDate(caseInfo.create_time),
        });
        if (res.code === 2000) {
            exceedanceDates.value = res.list
                .map(d => `${myCreateDate(d.ctime)}, ${d.max}`)
                .join('; ');
        } else {
            exceedanceDates.value = '数据获取失败';
        }
    } catch (err) {
        console.error(err);
        exceedanceDates.value = '请求出错';
    }
}

// 同步计算获取离线日期
function getOfflineDates(case_cday, create_time) {
  if (!case_cday || !create_time) return '';
  const createTimestamp = Date.parse(new Date(create_time + " 00:00:00"));
  let dateArray = [];
  // 从创建日期的前 a-1 天开始，倒推 a 天
  for (let i = case_cday; i > 0; i--) {
    const pastTimestamp = createTimestamp - 86400000 * i;
    dateArray.push(myCreateDate(pastTimestamp / 1000));
  }
  return dateArray.join('，');
}

</script>

<style lang="scss" scoped>
.case-detail-container {
  padding: 0 20px;
}
.margin-top {
  margin-top: 20px;
}
.history-card, .case-closure-card {
    margin-top: 25px;
}
.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.image-container {
  text-align: center;
}
.image-caption {
  margin-top: 5px;
  font-size: 13px;
  color: #606266;
}
</style>
