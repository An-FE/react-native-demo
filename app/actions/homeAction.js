export const homeTest = (data) => {
	// 1.发送请求（封装fetch）
	// 2.拼装数据
	// 3.返回标准对象到reducer
	return {
		type: 'homeTestAction',
		data
	}
}