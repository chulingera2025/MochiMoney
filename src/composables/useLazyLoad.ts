import { ref, onMounted, nextTick } from 'vue'

/**
 * 全局懒加载 Hook
 * 用于防止页面加载时的布局闪烁，支持渐入动画
 */
export function useLazyLoad() {
  const isLoading = ref(true)
  const showContent = ref(false)
  const fadeIn = ref(false)
  
  // 延迟显示内容，避免布局闪烁，支持渐入动画
  const showContentWithDelay = async (delay: number = 100) => {
    await nextTick()
    
    setTimeout(() => {
      showContent.value = true
      // 再延迟一帧触发渐入动画
      requestAnimationFrame(() => {
        fadeIn.value = true
        isLoading.value = false
      })
    }, delay)
  }
  
  // 立即显示内容
  const showContentImmediately = () => {
    showContent.value = true
    fadeIn.value = true
    isLoading.value = false
  }
  
  // 设置加载状态
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
    if (!loading) {
      showContent.value = true
      requestAnimationFrame(() => {
        fadeIn.value = true
      })
    }
  }
  
  return {
    isLoading,
    showContent,
    fadeIn,
    showContentWithDelay,
    showContentImmediately,
    setLoading
  }
}

/**
 * 异步数据加载 Hook
 * 自动处理加载状态和错误处理，支持渐入动画
 */
export function useAsyncData<T>(
  asyncFn: () => Promise<T>,
  options: {
    immediate?: boolean
    errorHandler?: (error: any) => void
    loadingDelay?: number
  } = {}
) {
  const { immediate = true, errorHandler, loadingDelay = 0 } = options
  
  const { isLoading, showContent, fadeIn, setLoading } = useLazyLoad()
  const data = ref<T | null>(null)
  const error = ref<any>(null)
  
  const execute = async () => {
    try {
      setLoading(true)
      error.value = null
      
      // 如果设置了加载延迟，先等待一下
      if (loadingDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, loadingDelay))
      }
      
      const result = await asyncFn()
      data.value = result
      
      // 延迟显示内容以避免闪烁，触发渐入动画
      await nextTick()
      setTimeout(() => {
        setLoading(false)
      }, 50)
      
    } catch (err) {
      error.value = err
      setLoading(false)
      
      if (errorHandler) {
        errorHandler(err)
      } else {
        console.error('异步数据加载失败:', err)
      }
    }
  }
  
  const refresh = () => {
    execute()
  }
  
  if (immediate) {
    onMounted(() => {
      execute()
    })
  }
  
  return {
    data,
    error,
    isLoading,
    showContent,
    fadeIn,
    execute,
    refresh
  }
}