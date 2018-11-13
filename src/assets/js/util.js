/**
 * 工具函数注册
 * @author lk 2018-11-08
 */ 
import axios from 'axios';
import Vue from 'vue';
import store from '@/store/index.js';
import common from '@/assets/js/common';
import { Message,MessageBox} from 'element-ui';
import toastComponent from '@/components/toast'
//axios
const service = axios.create({
    baseURL: 'https://easy-mock.com/mock/5bd6c161fffb9b57ff8cf3f8/admin', // api 的 base_url
    timeout: 5000 // 请求超时时间   
});
// request拦截器
service.interceptors.request.use(
    config => {
        config.headers['token'] = store.state.token || common.cookie.get('token'); // 让每个请求携带自定义token 请根据实际情况自行修改
        return config;
    },
    error => {
        console.log(error);
        Promise.reject(error);
    }
);
// response 拦截器
service.interceptors.response.use(
    response => {
        /**
         * code为非1是抛错 可结合自己业务进行修改
         */
        const res = response.data;
        if (res.code !== 1) {
            //登录的问题
            if (res.code === 1002) {
                MessageBox.confirm(
                    '你已被登出，可以取消继续留在该页面，或者重新登录',
                    '确定登出',
                    {
                        confirmButtonText: '重新登录',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                ).then(() => {
                    store.dispatch('logout').then(() => {
                        location.reload() // 为了重新实例化vue-router对象 避免bug
                    });
                })
            }else{
                Message({
                    message: res.message,
                    type: 'error',
                    duration:2000
                });
            }
            return Promise.reject('error');
        } else {
            return res;
        }
    },
    error => {
        Message({
            message: error.message,
            type: 'error',
            duration:2000
        });
        return Promise.reject(error);
    }
)
export default {
    install(Vue) {
        //ajax
        Vue.prototype.$ajax = service;
        //弹窗
        let instance = '';
        Vue.prototype.$toast = (content='系统繁忙,请重试',time=2000) => {
            if(instance == ''){
                let toastConstructor  = Vue.extend(
                    toastComponent
                );
                //生成组件
                instance = new toastConstructor({
                    data:{
                        content:content,
                        isShowToast:true
                    }
                });
                document.body.appendChild(instance.$mount().$el);
            }else{
                instance.isShowToast = true;
                instance.content = content;
            }
            setTimeout(() => { // 延迟2秒后移除该提示
                instance.isShowToast = false;
            },time);
        }
    }
}