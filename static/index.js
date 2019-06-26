	$(function () {
  			var date = new Date();
        var sen=(login,OldPas,NewPas)=>{
           socket.emit('sending', 
              {
                login:login,
                OldPas:OldPas,
                NewPas:NewPas,
              });
              $('#login').val('');
              $('#OldPas').val('');
              $('#NewPas').val('');
              $('#RepNewPas').val('');
        };
        //подключение 
   			var socket = io.connect();	
   			//отправка
    		 $('#f').submit(function(e){
      			e.preventDefault(); // prevents page reloading
            console.log($('#OldPas').val());
            if($('#NewPas').val().localeCompare($('#RepNewPas').val())===0)
            {
              if(($('#login').val()==='')||( $('#OldPas').val()==='')){
                $("#cmd").append( date.getHours()+":"+date.getMinutes()+"&gt;error:не все обязательные поля введены </br>");
                $('#login').val('');
                $('#OldPas').val('');
              }
              else{
                sen($('#login').val(),$('#OldPas').val(),$('#NewPas').val());
              }
            }
     			 else{
            $("#cmd").append( date.getHours()+":"+date.getMinutes()+"&gt;error:пароли не совпадают </br>");
            $('#NewPas').val('');
            $('#RepNewPas').val('');
            }
      			
    		 });
    		var main = document.getElementById("main");
    		var f = document.getElementById("f");
    		socket.on('eu', function(data){
    			
    			main.style.backgroundImage= data.s;
    			f.style.background=data.c;
    			if(!(data.alert===undefined)){
    				$("#cmd").append( date.getHours()+":"+date.getMinutes()+"&gt; "+data.alert+"</br>");
    			}
          else{
            $("#cmd").append( date.getHours()+":"+date.getMinutes()+"&gt;пользователя не существует </br>");
             
          }
    			console.log(data);
	         });
	      
    	})