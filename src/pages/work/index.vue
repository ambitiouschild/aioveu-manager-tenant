<template>
  <view class="work">
    <template v-for="(item, index) in gridList" :key="index">
      <!-- 使用 uni-card 替代 wd-card -->
      <uni-card :title="item.title" class="card-container">
        <!-- 使用 uni-grid 替代 wd-grid -->
        <uni-grid :column="4" :highlight="false" :square="false" class="grid-container">
          <uni-grid-item
            v-for="(child, childIndex) in item.children"
            :key="childIndex"
            class="grid-item"
          >
            <!-- 使用条件渲染替代 v-has-perm 指令 -->
            <view
              v-if="hasPermission(child.prem)"
              class="nav-item"
              @click="navigateTo(child.url)"
            >
              <view class="icon-container">
                <image class="item-icon" :src="child.icon" mode="aspectFit" />
              </view>
              <text class="item-text">{{ child.title }}</text>
            </view>
          </uni-grid-item>
        </uni-grid>
      </uni-card>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { reactive, computed } from 'vue';

// 权限检查函数
const hasPermission = (permission: string) => {
  if (!permission) return true;

  // 这里应该从用户信息中获取实际权限列表
  const userPermissions = [
    "sys:user:query",
    "sys:role:query",
    "sys:notice:query",
    "sys:config:query",
    "sys:log:query",
    "aioveuLaundryOrder:aioveu-laundry-order:query",
    "aioveuLaundryClothingType:aioveu-laundry-clothing-type:query",
    "aioveuLaundryOrderItem:aioveu-laundry-order-item:query",
    "aioveuLaundryProcessImage:aioveu-laundry-process-image:query",
    "aioveuMemberLevel:aioveu-member-level:query",
    "aioveuMember:aioveu-member:query",
    "aioveuMemberAccount:aioveu-member-account:query",
    "aioveuMemberRechargeRecord:aioveu-member-recharge-record:query",
    "aioveuDepartment:aioveuProcurement-department:query",
    "aioveuPosition:aioveuProcurement-position:query",
    "aioveuEmployee:aioveuProcurement-employee:query",
    "aioveuAttendance:aioveuProcurement-attendance:query",
    "aioveuPerformance:aioveuProcurement-performance:query",
    "aioveuSalary:aioveuProcurement-salary:query",
    "aioveuCategory:aioveuProcurement-category:query",
    "aioveuMaterial:aioveuProcurement-material:query",
    "aioveuWarehouse:aioveuProcurement-warehouse:query",
    "aioveuInventory:aioveuProcurement-inventory:query",
    "aioveuInbound:aioveuProcurement-inbound:query",
    "aioveuEquipment:aioveuProcurement-equipment:query",
    "aioveuProcurement:aioveuProcurement-procurement:query",
    "aioveuOutbound:aioveuProcurement-outbound:query",
    "aioveuCustomer:aioveuProcurement-customer:query",
    "aioveuContact:aioveuProcurement-contact:query",
    "aioveuTransaction:aioveuProcurement-transaction:query",
    "aioveuSalesOrder:aioveuProcurement-sales-order:query",
    "aioveuSalesOrderDetail:aioveuProcurement-sales-order-detail:query"
  ];

  return userPermissions.includes(permission);
};

// 导航跳转函数
const navigateTo = (url: string) => {
  uni.navigateTo({
    url: url
  });
};

const gridList = reactive([
  {
    title: "洗护管理",
    children: [
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "洗衣订单",
        url: "/packageG/pages/aioveu_laundry/laundry_order/index",
        prem: "aioveuLaundryOrder:aioveu-laundry-order:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "衣物类型",
        url: "/packageG/pages/aioveu_laundry/laundry_clothing_type/index",
        prem: "aioveuLaundryClothingType:aioveu-laundry-clothing-type:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "洗衣订单衣物明细",
        url: "/packageG/pages/aioveu_laundry/laundry_order_item/index",
        prem: "aioveuLaundryOrderItem:aioveu-laundry-order-item:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "洗衣流程图片记录",
        url: "/packageG/pages/aioveu_laundry/laundry_process_image/index",
        prem: "aioveuLaundryProcessImage:aioveu-laundry-process-image:query",
      },
    ],
  },
  {
    title: "会员管理",
    children: [
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "会员等级",
        url: "/packageF/pages/aioveu_member/member_level/index",
        prem: "aioveuMemberLevel:aioveu-member-level:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "会员信息",
        url: "/packageF/pages/aioveu_member/member/index",
        prem: "aioveuMember:aioveu-member:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "会员充值账户",
        url: "/packageF/pages/aioveu_member/member_account/index",
        prem: "aioveuMemberAccount:aioveu-member-account:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "会员充值记录",
        url: "/packageF/pages/aioveu_member/member_recharge_record/index",
        prem: "aioveuMemberRechargeRecord:aioveu-member-recharge-record:query",
      },
    ],
  },
  {
    title: "人员管理",
    children: [
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "部门管理",
        url: "/packageC/pages/aioveu_department/department/index",
        prem: "aioveuDepartment:aioveuProcurement-department:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "岗位管理",
        url: "/packageC/pages/aioveu_department/position/index",
        prem: "aioveuPosition:aioveuProcurement-position:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "员工管理",
        url: "/packageC/pages/aioveu_department/employee/index",
        prem: "aioveuEmployee:aioveuProcurement-employee:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "考勤管理",
        url: "/packageC/pages/aioveu_department/attendance/index",
        prem: "aioveuAttendance:aioveuProcurement-attendance:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "绩效管理",
        url: "/packageC/pages/aioveu_department/performance/index",
        prem: "aioveuPerformance:aioveuProcurement-performance:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "薪资管理",
        url: "/packageC/pages/aioveu_department/salary/index",
        prem: "aioveuSalary:aioveuProcurement-salary:query",
      },
    ],
  },
  {
    title: "物资管理",
    children: [
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "物资分类管理",
        url: "/packageD/pages/aioveu_material/category/index",
        prem: "aioveuCategory:aioveuProcurement-category:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "物资管理",
        url: "/packageD/pages/aioveu_material/material/index",
        prem: "aioveuMaterial:aioveuProcurement-material:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "仓库管理",
        url: "/packageD/pages/aioveu_material/warehouse/index",
        prem: "aioveuWarehouse:aioveuProcurement-warehouse:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "库存管理",
        url: "/packageD/pages/aioveu_material/inventory/index",
        prem: "aioveuInventory:aioveuProcurement-inventory:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "入库管理",
        url: "/packageD/pages/aioveu_material/inbound/index",
        prem: "aioveuInbound:aioveuProcurement-inbound:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "设备管理",
        url: "/packageD/pages/aioveu_material/equipment/index",
        prem: "aioveuEquipment:aioveuProcurement-equipment:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "采购管理",
        url: "/packageD/pages/aioveu_material/procurement/index",
        prem: "aioveuProcurement:aioveuProcurement-procurement:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "出库管理",
        url: "/packageD/pages/aioveu_material/outbound/index",
        prem: "aioveuOutbound:aioveuProcurement-outbound:query",
      },
    ],
  },
  {
    title: "客户管理",
    children: [
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "客户管理",
        url: "/packageE/pages/aioveu_customer/customer/index",
        prem: "aioveuCustomer:aioveuProcurement-customer:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "联系人管理",
        url: "/packageE/pages/aioveu_customer/contact/index",
        prem: "aioveuContact:aioveuProcurement-contact:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "交易管理",
        url: "/packageE/pages/aioveu_customer/transaction/index",
        prem: "aioveuTransaction:aioveuProcurement-transaction:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "订单管理",
        url: "/packageE/pages/aioveu_customer/sales_order/index",
        prem: "aioveuSalesOrder:aioveuProcurement-sales-order:query",
      },
      {
        icon: "https://minio.aioveu.com/aioveu/logo.png",
        title: "订单明细管理",
        url: "/packageE/pages/aioveu_customer/sales_order_detail/index",
        prem: "aioveuSalesOrderDetail:aioveuProcurement-sales-order-detail:query",
      },
    ],
  },
  {
    title: "系统管理",
    children: [
      {
        icon: "/static/icons/user.png",
        title: "用户管理",
        url: "/packageB/pages/work/user/index",
        prem: "sys:user:query",
      },
      {
        icon: "/static/icons/role.png",
        title: "角色管理",
        url: "/packageB/pages/work/role/index",
        prem: "sys:role:query",
      },
      {
        icon: "/static/icons/notice.png",
        title: "通知公告",
        url: "/packageB/pages/work/notice/index",
        prem: "sys:notice:query",
      },
      {
        icon: "/static/icons/setting.png",
        title: "系统配置",
        url: "/packageB/pages/work/config/index",
        prem: "sys:config:query",
      },
    ],
  },
  {
    title: "系统监控",
    children: [
      {
        icon: "/static/icons/log.png",
        title: "系统日志",
        url: "/packageB/pages/work/log/index",
        prem: "sys:log:query",
      },
    ],
  },
]);
</script>

<style lang="scss" scoped>
/* stylelint-disable selector-type-no-unknown */
page {
  background: #f8f8f8;
}
/* stylelint-enable selector-type-no-unknown */

.work {
  padding: 40rpx 0;
}

.card-container {
  margin: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.grid-container {
  padding: 20rpx 0;
}

.grid-item {
  padding: 20rpx 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20rpx;
  box-sizing: border-box;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 16rpx;
}

.item-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 8rpx;
}

.item-text {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  line-height: 1.4;
}

// 响应式调整
@media (max-width: 768px) {
  .grid-container {
    :deep(.uni-grid) {
      // 在小屏幕上调整为3列
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .nav-item {
    padding: 16rpx;
  }

  .icon-container {
    width: 60rpx;
    height: 60rpx;
  }

  .item-icon {
    width: 60rpx;
    height: 60rpx;
  }

  .item-text {
    font-size: 22rpx;
  }
}

// 点击效果
.nav-item:active {
  background-color: #f5f5f5;
  border-radius: 12rpx;
  transform: scale(0.95);
  transition: all 0.2s ease;
}
</style>
