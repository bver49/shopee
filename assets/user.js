$(document).ready(function() {
	
	toastr.options = {
		"closeButton": true,
		"positionClass": "toast-top-right",
		"showDuration": "0",
		"hideDuration": "1000",
		"timeOut": "2000",
		"extendedTimeOut": "1000"
	}

	//登入
	$("#login").on("click", function() {
		if ($("#username").val() == "" || $("#password").val() == "") {
			toastr.warning("請輸入帳號與密碼");
		} else {
			$.ajax({
				url: '/users/auth',
				type: 'POST',
				data: {
					username: $("#username").val(),
					password: $("#password").val()
				},
				success: function(response) {
					if (response == "ok") {
						location.href = "/";
					} else {
						toastr.warning(response);
					}
				}
			});
		}
	});

	//註冊
	$("#signup").on("click", function() {
		if ($("#username").val() == "" || $("#password").val() == "") {
			toastr.warning("請輸入帳號與密碼");
		} else {
			$.ajax({
				url: '/users',
				type: 'POST',
				data: {
					username: $("#username").val(),
					password: $("#password").val()
				},
				success: function(response) {
					if (response == "ok") {
						toastr.success("註冊成功，請等待管理員開通");
						setTimeout(function() {
							location.href = "/users/login";
						}, 2000)
					} else {
						toastr.warning(response);
					}
				}
			});
		}
	});

	//新增用戶
	$("#adduser").on("click", function() {
		if ($("#username").val() == "" || $("#password").val() == "") {
			toastr.warning("請輸入帳號與密碼");
		} else {
			$.ajax({
				url: '/users',
				type: 'POST',
				data: {
					username: $("#username").val(),
					password: $("#password").val()
				},
				success: function(response) {
					if (response == "ok") {
						toastr.success("新增成功");
						setTimeout(function() {
							location.href = "/users";
						}, 2000)
					} else {
						toastr.warning(response);
					}
				}
			});
		}
	});

	//更新資料
	$("#update").on("click", function() {
		if ($("#username").val() != "" || $("#password").val() != "") {
			var data = {}
			if ($("#username").val() != "") data.username = $("#username").val();
			if ($("#password").val() != "") data.password = $("#password").val();
			$.ajax({
				url: '/users/' + $(this).data("id"),
				type: 'PUT',
				data: data,
				success: function(response) {
					if (response == "ok") {
						toastr.success("更新成功");
						setTimeout(function() {
							location.href = "/";
						}, 2000)
					} else {
						toastr.warning(response);
					}
				}
			});
		}
	});

	//刪除用戶
	$(".deluser").on("click", function() {
		var id = $(this).data("id");
		if (confirm("確定要刪除用戶?")) {
			$.ajax({
				url: '/users/' + $(this).data("id"),
				type: 'DELETE',
				success: function(response) {
					if (response == "ok") {
						toastr.success("刪除成功");
						$("#user" + id).remove();
					} else {
						toastr.warning(response);
					}
				}
			});
		}
	});

	//開通用戶
	$(".verifyuser").on("click", function() {
		var id = $(this).data("id");
		if (confirm("確定要開通用戶?")) {
			$.ajax({
				url: '/users/verify/' + $(this).data("id"),
				type: 'PUT',
				success: function(response) {
					if (response == "ok") {
						toastr.success("開通成功");
						setTimeout(function() {
							location.href = location.href;
						}, 1500)
					} else {
						toastr.warning(response);
					}
				}
			});
		}
	});

	//新增用戶權限
	$(".allowjob").on("click", function() {
		var id = $(this).data("id");
		if (confirm("確定要新增權限?")) {
			$.ajax({
				url: '/users/allow/' + $(this).data("job") + '/' + $(this).data("id"),
				type: 'PUT',
				success: function(response) {
					if (response == "ok") {
						toastr.success("新增成功");
						setTimeout(function() {
							location.href = location.href;
						}, 1000)
					} else {
						toastr.warning(response);
					}
				}
			});
		}
	});

	//移除用戶權限
	$(".notallowjob").on("click", function() {
		var id = $(this).data("id");
		if (confirm("確定要移除權限?")) {
			$.ajax({
				url: '/users/notallow/' + $(this).data("job") + '/' + $(this).data("id"),
				type: 'PUT',
				success: function(response) {
					if (response == "ok") {
						toastr.success("移除成功");
						setTimeout(function() {
							location.href = location.href;
						}, 1000)
					} else {
						toastr.warning(response);
					}
				}
			});
		}
	});

	$("#editprofile").on("click", function() {
		$("#profile").hide();
		$("#profileform").show();
	});

	$("#showprofile").on("click", function() {
		$("#profile").show();
		$("#profileform").hide();
	});
});
