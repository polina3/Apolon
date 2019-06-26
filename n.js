
const bcrypt = require('bcrypt');//библ для хэширования
var express= require('express');//библ для маршутизации и сервера
var app = express();//
var server=require('http').createServer(app);
var io = require('socket.io').listen(server);//библ для поддержания канала и слушенье его
var ldap = require('ldapjs');//библ для работы с LDAP
var async = require('async');
var Ber = require('asn1').Ber;
var p;//переменная для контроля нашёлся ли пользователь или нет 
p=false;	
var er;//переменная для отслеживания ошибок 
er=false;	



/** The OID of the modify password extended operation */
var LDAP_EXOP_X_MODIFY_PASSWD = '1.3.6.1.4.1.4203.1.11.1';
/** The BER tag for the modify password dn entry */
var LDAP_TAG_EXOP_X_MODIFY_PASSWD_ID = 0x80;
/** The BER tag for the modify password new password entry */
var LDAP_TAG_EXOP_X_MODIFY_PASSWD_OLD = 0x81;
/** The BER tag for the modify password new password entry */
var LDAP_TAG_EXOP_X_MODIFY_PASSWD_NEW = 0x82;

const LOp={
	url: "",//server
	connecttimeout: ,
	reconnect: 
};//объект для подключения к LDAP
var b={
	l:'',//login
	p:''//password
}//данные для бинда для поиска

var Cl=function (login,Pas,NewPas='') {	//функция для бинда и поиска
			let person;//переменная в которой будет хранится объект с инфой о найденной записи
			let opts = {
  				filter: '(&(uid='+login+')(objectClass=inetOrgPerson))',//критерий поиска
  				scope: 'sub',//поддерево
  				attributes: ['dn', 'sn', 'cn', 'userPassword', 'userid', 'givenName']//атрибуты которые нужны
			}//параметры поиска
			let rez;
			rez=0;
 		client.search('dc=usr,dc=subj,dc=niissu', opts, function(err, res) //сам поиск
 		{

			res.on('searchEntry', function(entry) {//событие которое происходит если запись найдена
				console.log(JSON.stringify(entry.object));//ввывод записи в консоль которую нашел 
				person=entry.object;//перемещаем в переменную
				rez=1;
				ClientPerson.bind(//сам бинд
					person.dn,//берем из найденной записи dn
					Pas,//берем пароль который передается в фукцию в качестве аргумента 
					function(err,res) {
						if(err){//если ошибка
							console.log(err);//ввывод ошибки 
							er=true;//так как была совершина ошибка мы меняем значение переменной
							io.emit('eu',{s: "url('/static/no.png')",c:"#990000",alert:"неправильный пароль"});//отправляем на странницу соотвествующий ответ 
							console.log("------*неправильный пароль,пользователь был найден ,но пароль не правильный введенный с формы*------");//код ошибки где она случилась ввыводим в консоль
						}
						else{
							if(NewPas!='')//если пароль был введен 
							{
								var dn=person.dn;
								var op=Pas;
								var np=NewPas;
								var writer = new Ber.Writer();
    							writer.startSequence();
							    writer.writeString(dn, LDAP_TAG_EXOP_X_MODIFY_PASSWD_ID);
							    writer.writeString(op, LDAP_TAG_EXOP_X_MODIFY_PASSWD_OLD);
							    writer.writeString(np, LDAP_TAG_EXOP_X_MODIFY_PASSWD_NEW);
							    writer.endSequence();
							    ClientPerson.exop(LDAP_EXOP_X_MODIFY_PASSWD, writer.buffer, function(err, result) {
							        if (err) {
							            ClientPerson.unbind();
							            console.log(err);
							        } else {
							            console.log('Sucessfully modified password', 'info');
							            
						        	}
						        	io.emit('eu',{s: "url('/static/u.png')",c:"#005999",alert:"пароль успешно изменён"} );
						        });	

							}
							else{//если пароль не был введен ,но пользователь всё же был найден и успешно забиндился мы сообщаем что пользователь правильный 
								io.emit('eu',{s: "url('/static/yes.png')",c:"#087500",alert:"пользователь найден"} );//отправляем на странницу соотвествующий ответ
							}
						}
						ClientPerson.unbind();//разбиндовываемся
						
					});
			});

			res.on('searchReference', function(referral) {
				console.log('referral: ' + referral.uris.join());
			});
			res.on('error', function(err) {//если ошибка при поиске
				 console.error('error: ' + err.message);

			});
			res.on('end', function(result) {
				//console.log('Result is', result);
				console.log(rez);
				if(rez===0){
					io.emit('eu',{s: "url('/static/no.png')",c:"#990000",alert:"пользователя не существует"});
				}
			});
		});
		
}

var client = ldap.createClient(LOp);//создание клиента для поиска
var ClientPerson = ldap.createClient(LOp);//создание клиента глобального что бы его было видно из любого места кода найденой записи 

client.bind(//сам бинд клиента для поиска
	b.l,
	b.p,
	function(err) {
			console.log(err);
	});

app.use('/static',express.static('static'));

server.listen(3000);

app.get('/',function(req,res) {
	res.sendFile(__dirname+'/index.html');
})

io.on('connection', function(socket){//открытие web-sokcet
 	console.log('a user connected');

 	socket.on('disconnect', function(){//при отключении(ухода) с сайта 
    	console.log('user disconnected');
  	});

  	socket.on('sending',function(data) {//когда на сайте сработало это событие
		Cl(data.login,data.OldPas,data.NewPas);//функция 

	});

});