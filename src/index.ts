import type { App, Plugin } from 'vue';

// 导入所有
import ExAffix from './components/affix';
import ExAlert from './components/alert';
import ExAnchor, { ExAnchorLink } from './components/anchor';
import ExAvatar from './components/avatar';
import ExBadge from './components/badge';
import ExBreadcrumb, { ExBreadcrumbItem } from './components/breadcrumb';
import ExButton from './components/button';
import ExCard from './components/card';
import ExCheckbox, { ExCheckboxGroup } from './components/checkbox';
import ExCollapse, { ExCollapseItem } from './components/collapse';
import ExConfigProvider from './components/config-provider';
import ExDialog from './components/dialog';
import ExDivider from './components/divider';
import ExDrawer from './components/drawer';
import ExDropdown, { ExDropdownItem } from './components/dropdown';
import ExEllipsis from './components/ellipsis';
import ExEmpty from './components/empty';
import FlexPlugin, { ExFlex, ExFlexItem } from './components/flex';
import ExForm, { ExFormItem } from './components/form';
import GridPlugin, { ExGrid, ExGridItem } from './components/grid';
import ExHeatmap from './components/heatmap';
import ExIcon from './components/icon';
import ExTag, { ExTagInput } from './components/tag';
import {
  LayoutPlugin,
  ExLayout,
  ExHeader,
  ExContent,
  ExFooter,
  ExSider,
  ExContainer,
} from './components/layout';
import ExImage from './components/image';
import ExDatePicker from './components/date-picker';
import ExTimePicker from './components/time-picker';
import ExDateTimePicker from './components/datetime-picker';
import ExInput from './components/input';
import ExLink from './components/link';
import ExList from './components/list';
import ExLoading from './components/loading';
import ExLoadingBar, { loadingBar } from './components/loading-bar';
import MenuPlugin, { ExMenu, ExMenuItem, ExSubMenu } from './components/menu';
import ExMessage, { message } from './components/message';
import ExModal from './components/modal';
import ExNotification, { notification } from './components/notification';
import ExPagination from './components/pagination';
import ExPanel from './components/panel';
import ExPopconfirm from './components/popconfirm';
import ExPopover from './components/popover';
import ExProgress from './components/progress';
import ExQRCode from './components/qrcode';
import ExBarcode from './components/barcode';
import ExRadio, { ExRadioGroup } from './components/radio';
import ExRate from './components/rate';
import ExSelect from './components/select';
import ExSkeleton from './components/skeleton';
import ExSlider from './components/slider';
import ExSpace from './components/space';
import ExSteps, { ExStep } from './components/steps';
import ExSwitch from './components/switch';
import ExTable from './components/table';
import ExTabs, { ExTabPane } from './components/tabs';
import ExTooltip from './components/tooltip';
import ExTree from './components/tree';
import ExTypography from './components/typography';
import ExVirtualList from './components/virtual-list';
import ExWatermark from './components/watermark';
import ExFileUpload from './components/file-upload';
import ExFileDownload from './components/file-download';
import ExFilePreview from './components/file-preview';
import ExImageCrop from './components/image-crop';
import ExImageCompress from './components/image-compress';
import ExFileList from './components/file-list';
import ExCalendar from './components/calendar';
import TimelinePlugin, { ExTimeline, ExTimelineItem } from './components/timeline';
import ExCode from './components/code';
import CarouselPlugin, { ExCarousel, ExCarouselItem } from './components/carousel';
import ExCascader from './components/cascader';
import ExNumberInput from './components/number-input';
import ExBackTop from './components/back-top';
import ExPageHeader from './components/page-header';
import ExChart from './components/chart';
import ExVerificationCode from './components/verification-code';

// 导入样式（全局导入时自动引入）
import './styles/index.scss';

// 导出所有组
export {
  ExAffix,
  ExAlert,
  ExAnchor,
  ExAnchorLink,
  ExAvatar,
  ExBadge,
  ExBreadcrumb,
  ExBreadcrumbItem,
  ExButton,
  ExCard,
  ExCheckbox,
  ExCheckboxGroup,
  ExCollapse,
  ExCollapseItem,
  ExConfigProvider,
  ExDialog,
  ExDivider,
  ExDrawer,
  ExDropdown,
  ExDropdownItem,
  ExEllipsis,
  ExEmpty,
  ExFlex,
  ExFlexItem,
  ExForm,
  ExFormItem,
  ExGrid,
  ExGridItem,
  ExHeatmap,
  ExIcon,
  ExLayout,
  ExHeader,
  ExContent,
  ExFooter,
  ExSider,
  ExContainer,
  ExImage,
  ExInput,
  ExLink,
  ExList,
  ExLoading,
  ExLoadingBar,
  MenuPlugin,
  ExMenu,
  ExMenuItem,
  ExSubMenu,
  ExMessage,
  ExModal,
  ExNotification,
  ExPagination,
  ExPanel,
  ExPopconfirm,
  ExPopover,
  ExProgress,
  ExQRCode,
  ExBarcode,
  ExRadio,
  ExRadioGroup,
  ExRate,
  ExSelect,
  ExSkeleton,
  ExSlider,
  ExSpace,
  ExSteps,
  ExStep,
  ExSwitch,
  ExTable,
  ExTabs,
  ExTabPane,
  ExTooltip,
  ExTree,
  ExTypography,
  ExVirtualList,
  ExWatermark,
  ExDatePicker,
  ExTimePicker,
  ExDateTimePicker,
  ExTag,
  ExTagInput,
  ExFileUpload,
  ExFileDownload,
  ExFilePreview,
  ExImageCrop,
  ExImageCompress,
  ExFileList,
  ExCalendar,
  ExTimeline,
  ExTimelineItem,
  ExCode,
  ExCarousel,
  ExCarouselItem,
  ExCascader,
  ExNumberInput,
  ExChart,
  ExBackTop,
  ExPageHeader,
  ExVerificationCode,
  notification,
  message,
  loadingBar,
};

// 导出类型
export type * from './components/affix/types';
export type * from './components/alert/types';
export type * from './components/anchor/types';
export type * from './components/avatar/types';
export type * from './components/badge/types';
export type * from './components/breadcrumb/types';
export type * from './components/datetime-picker/types';
export type * from './components/button/types';
export type * from './components/card/types';
export type * from './components/checkbox/types';
export type * from './components/collapse/types';
export type * from './components/config-provider/types';
export type * from './components/dialog/types';
export type * from './components/divider/types';
export type { DrawerPlacement, DrawerSize } from './components/drawer/types';
export type * from './components/dropdown/types';
export type * from './components/ellipsis/types';
export type * from './components/empty/types';
export type * from './components/flex/types';
export type * from './components/form/types';
export type * from './components/grid/types';
export type * from './components/heatmap/types';
export type * from './components/icon/types';
export type * from './components/layout/types';
export type * from './components/image/types';
export type * from './components/input/types';
export type * from './components/link/types';
export type * from './components/list/types';
export type * from './components/loading/types';
export type {
  LoadingBarOptions,
  LoadingBarInstance,
  LoadingBarStatus,
} from './components/loading-bar/types';
export type * from './components/menu/types';
export type { MessageOptions, MessageInstance, MessageType } from './components/message/types';
export type * from './components/modal/types';
export type {
  NotificationOptions,
  NotificationInstance,
  NotificationType,
  NotificationPosition,
} from './components/notification/types';
export type * from './components/pagination/types';
export type * from './components/panel/types';
export type * from './components/popconfirm/types';
export type { PopoverPlacement, PopoverTrigger } from './components/popover/types';
export type { ProgressType, ProgressStatus, ProgressColor } from './components/progress/types';
export type * from './components/qrcode/types';
export type * from './components/barcode/types';
export type * from './components/radio/types';
export type * from './components/rate/types';
export type * from './components/select/types';
export type * from './components/skeleton/types';
export type * from './components/slider/types';
export type * from './components/space/types';
export type * from './components/steps/types';
export type * from './components/switch/types';
export type * from './components/table/types';
export type * from './components/tabs/types';
// export type * from './components/time-picker/types' // DisabledTime, TimePanelProps conflicts with date-picker/types
export type { TooltipPlacement, TooltipTrigger, TooltipEffect } from './components/tooltip/types';
export type * from './components/tree/types';
export type * from './components/typography/types';
export type * from './components/virtual-list/types';
export type * from './components/watermark/types';
export type * from './components/tag/types';
export type * from './components/file-upload/types';
export type * from './components/file-download/types';
export type * from './components/file-preview/types';
export type * from './components/image-crop/types';
export type * from './components/image-compress/types';
export type * from './components/file-list/types';
export type * from './components/calendar/types';
export type * from './components/timeline/types';
export type * from './components/code/types';
export type * from './components/carousel/types';
export type * from './components/cascader/types';
export type * from './components/number-input/types';
export type * from './components/chart/types';
export type * from './components/back-top/types';
export type { PageHeaderProps, PageHeaderEmits } from './components/page-header/types';
export type * from './components/verification-code/types';
export type {
  DateValue,
  DateRangeValue,
  DatePickerType,
  DatePickerSize,
  DatePickerPlacement,
  DatePickerShortcut,
  DateShortcut,
  DatePickerDisabledDate,
  ExDatePickerProps,
  ExDatePickerEmits,
  DatePickerPanelProps,
  DatePickerCalendarProps,
  DatePickerTimeProps,
  DisabledTime as DatePickerDisabledTime,
  TimePanelProps as DatePickerTimePanelProps,
  DatePanelProps,
  DateUtils as DatePickerUtils,
} from './components/date-picker/types';
export type {
  TimeValue,
  TimeFormat,
  TimePickerSize,
  TimePickerStatus,
  TimeStep,
  TimeRange,
  DisabledTime as TimePickerDisabledTime,
  ExTimePickerProps,
  ExTimeRangePickerProps,
  TimePanelProps as TimePickerPanelProps,
  TimeColumnProps,
  TimeOption,
  TimeChangeEvent,
  TimeRangeChangeEvent,
  TimeUtils as TimePickerUtils,
} from './components/time-picker/types';
// 导出 Config Provider
export * from './components/config-provider/composables';
export {
  enUS,
  zhCN,
  createLocaleProvider,
  useI18n,
  setLocale,
  getCurrentLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from './locale';

// 所有组件列
// 修复组件安装问题
const components = [
  ExAffix,
  ExAlert,
  ExAnchor,
  ExAnchorLink,
  ExAvatar,
  ExBadge,
  ExBreadcrumb,
  ExBreadcrumbItem,
  ExButton,
  ExCard,
  ExCheckbox,
  ExCheckboxGroup,
  ExCollapse,
  ExCollapseItem,
  ExConfigProvider,
  ExDialog,
  ExDivider,
  ExDrawer,
  ExDropdown,
  ExEllipsis,
  ExEmpty,
  FlexPlugin,
  ExForm,
  ExFormItem,
  GridPlugin,
  ExHeatmap,
  ExIcon,
  LayoutPlugin,
  ExImage,
  ExInput,
  ExLink,
  ExList,
  ExLoading,
  ExLoadingBar,
  MenuPlugin,
  ExMessage,
  ExModal,
  ExNotification,
  ExPagination,
  ExPanel,
  ExPopconfirm,
  ExPopover,
  ExProgress,
  ExQRCode,
  ExBarcode,
  ExRadio,
  ExRadioGroup,
  ExRate,
  ExSelect,
  ExSkeleton,
  ExSlider,
  ExSpace,
  ExSteps,
  ExStep,
  ExSwitch,
  ExTable,
  ExTabs,
  ExTabPane,
  ExDatePicker,
  ExTimePicker,
  ExDateTimePicker,
  ExTooltip,
  ExTree,
  ExTypography,
  ExVirtualList,
  ExWatermark,
  ExTag,
  ExTagInput,
  ExFileUpload,
  ExFileDownload,
  ExFilePreview,
  ExImageCrop,
  ExImageCompress,
  ExFileList,
  ExCalendar,
  TimelinePlugin,
  ExCode,
  CarouselPlugin,
  ExCascader,
  ExNumberInput,
  ExChart,
  ExBackTop,
  ExPageHeader,
  ExVerificationCode,
];

// 安装函数
const install: Plugin['install'] = (app: App) => {
  components.forEach(component => {
    if (component && typeof component === 'object' && 'install' in component) {
      app.use(component as { install: (app: App) => void });
    }
  });
};

// 版本号：优先使用构建期注入的 __EX_UI_VERSION__，在未注入场景下回退为 'dev'
// 使用 typeof 检测可以在未声明变量时避免运行时错误

const version =
  typeof (__EX_UI_VERSION__ as any) !== 'undefined' ? (__EX_UI_VERSION__ as string) : 'dev';

// 默认导出 - 符合 Vue Plugin 类型
export default {
  install,
  version,
} as Plugin & { version: string };

// 导出主题相关 API
export {
  useTheme,
  setTheme,
  getTheme,
  toggleTheme,
  onThemeChange,
  useSystemTheme,
  usePersistedTheme,
  saveThemeToStorage,
  loadThemeFromStorage,
} from './composables/useTheme';

// 导出主题类型和工具函
export type {
  Theme,
  ThemeConfig,
  ThemeVariables,
  CustomThemeConfig,
  ThemeSwitchOptions,
  ThemeChangeEvent,
} from './types/theme.d';
export { THEME_CONFIGS, getThemeConfig, isDarkTheme, isHighContrastTheme } from './types/theme.d';

export * from './utils';
