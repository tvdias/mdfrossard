// AJAXified commenting system
jQuery('document').ready(function($){
	var commentform=$('#commentform'); // find the comment form
	
	var statusdiv=$('#msg-status'); // define the infopanel
	
	commentform.submit(function(){
		//serialize and store form data in a variable
		var formdata=commentform.serialize();
		
		//Extract action URL from commentform
		var formurl=commentform.attr('action');
		var erro = 0;
		
		if (!attributeSupported("required") || isSafariOnly()) {
			$("#commentform [required]").each(function(index) {
				if (!$(this).val()) {
					alert("Preencha todos os campos obrigatórios.");
					erro = 1;
					return false;
				}
			});
		}
		if (erro == 0){		
		//Add a status message
		statusdiv.html('Enviando...');
		//Post Form with data
			$.ajax({
				type: 'post',
				url: formurl,
				data: formdata,
				dataType: 'xml',
				cache: false,
				error: function(XMLHttpRequest, textStatus, errorThrown){
							statusdiv.css('color','red');
							statusdiv.html('Falha no envio! Tente novamente mais tarde.');
				},
				success: function(xml){
						var res = 0;
						
						$(xml).find('enviar').each(function () {
							res = $(this).find('resultado').text();
						});
						//statusdiv.css('margin-top','5px');
						if(res=="1"){
							statusdiv.css('color','#12A19A');
							statusdiv.html('Mensagem enviada. Entraremos em contato em breve.');
						}
						else{
							statusdiv.css('color','red');
							statusdiv.html('Falha no envio! Tente novamente mais tarde.');
						}
				}
			});
		}
		return false;		
	});	
});

function attributeSupported(attribute) {
    return (attribute in document.createElement("input"));
}

function isSafariOnly() {
    return navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
}