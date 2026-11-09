const api=window.grautam,$=s=>document.querySelector(s),form=$('#profileForm'),avatarFile=$('#avatarFile'),preview=$('#avatarPreview'),message=$('#profileMessage'),saveButton=$('#saveProfile'),deleteButton=$('#deleteProfile');
let avatarData=null,currentName='Grautam';
const initials=value=>String(value||'G').trim().split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase();
function setMessage(text,error=false){message.textContent=text;message.classList.toggle('error',error)}
function renderAvatar(){preview.replaceChildren();if(avatarData){const image=document.createElement('img');image.src=avatarData;image.alt='Foto selecionada';preview.append(image)}else preview.textContent=initials(currentName)}
function fillProfile(profile){if(!profile)return;currentName=profile.fullName;for(const field of form.elements)if(field.name&&profile[field.name]!=null)field.value=profile[field.name];avatarData=profile.avatar||null;renderAvatar();deleteButton.hidden=false}
const today=new Date();form.elements.birthDate.max=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
$('#documentType').addEventListener('change',event=>{$('#documentNumber').placeholder=event.target.value==='CPF'?'000.000.000-00':'Número do passaporte'});
$('#chooseAvatar').addEventListener('click',()=>avatarFile.click());
$('#removeAvatar').addEventListener('click',()=>{avatarData=null;renderAvatar();setMessage('Foto removida. Salve para confirmar.')});
avatarFile.addEventListener('change',async()=>{const file=avatarFile.files?.[0];if(!file)return;
if(!['image/png','image/jpeg'].includes(file.type)||file.size>12*1024*1024){setMessage('Escolha um PNG ou JPG de até 12 MB.',true);avatarFile.value='';return}
try{const bitmap=await createImageBitmap(file),scale=Math.min(1,640/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');
canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
canvas.getContext('2d',{alpha:file.type==='image/png'}).drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
avatarData=canvas.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',0.86);
if(avatarData.length*0.75>1.5*1024*1024){avatarData=null;throw new Error('A foto otimizada ainda excede 1,5 MB. Escolha uma imagem menor.')}
currentName=form.elements.fullName.value||currentName;renderAvatar();setMessage('Foto pronta para salvar.')
}catch(error){setMessage(error.message||'Não foi possível abrir essa imagem.',true)}finally{avatarFile.value=''}});
form.elements.fullName.addEventListener('input',()=>{if(!avatarData){currentName=form.elements.fullName.value;renderAvatar()}});
form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;saveButton.disabled=true;setMessage('Protegendo e salvando seus dados…');
try{const profile=Object.fromEntries(new FormData(form));profile.avatar=avatarData;await api.request('profile:save',profile);currentName=profile.fullName;deleteButton.hidden=false;setMessage('Perfil salvo com proteção local. Voltando ao painel…');setTimeout(()=>api.request('window:open',{name:'dashboard'}),650)}
catch(error){setMessage(error.message||'Não foi possível salvar seu perfil.',true)}finally{saveButton.disabled=false}});
deleteButton.addEventListener('click',async()=>{if(!window.confirm('Excluir o perfil e a foto deste dispositivo?'))return;try{await api.request('profile:clear');form.reset();avatarData=null;currentName='Grautam';renderAvatar();deleteButton.hidden=true;setMessage('Dados locais excluídos.')}catch(error){setMessage(error.message||'Não foi possível excluir os dados.',true)}});
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>api.request('window:open',{name:button.dataset.open})));
api.request('profile:get').then(fillProfile).catch(error=>setMessage(error.message||'Não foi possível carregar o perfil.',true));