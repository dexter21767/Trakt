const STYLESHEET = `
* {
   box-sizing: border-box;
}

body,
html {
   margin: 0;
   padding: 0;
   width: 100%;
   height: 100%
}

html {
	background: fixed;
	background-size: auto 100%;
	background-size: cover;
	background-position: center center;
	background-repeat: repeat-y;
}

body {
   display: flex;
   background-color: transparent;
   font-family: 'Open Sans', Arial, sans-serif;
   color: white;
}

h1 {
   font-size: 4.5vh;
   font-weight: 700;
}

h2 {
   font-size: 2.2vh;
   font-weight: normal;
   font-style: italic;
   opacity: 0.8;
}

h3 {
   font-size: 2.2vh;
}

h1,
h2,
h3,
p,
label {
   margin: 0;
   text-shadow: 0 0 1vh rgba(0, 0, 0, 0.15);
}

p {
   font-size: 1.75vh;
}

ul {
   font-size: 1.75vh;
   margin: 0;
   margin-top: 1vh;
   padding-left: 3vh;
}

a {
   color: green
}

a.install-link {
   text-decoration: none
}

button {
   border: 0;
   outline: 0;
   color: white;
   background: #8A5AAB;
   padding: 1.2vh 3.5vh;
   margin: auto;
   text-align: center;
   font-family: 'Open Sans', Arial, sans-serif;
   font-size: 2.2vh;
   font-weight: 600;
   cursor: pointer;
   display: block;
   box-shadow: 0 0.5vh 1vh rgba(0, 0, 0, 0.2);
   transition: box-shadow 0.1s ease-in-out;
}

button:hover {
   box-shadow: none;
}

button:active {
   box-shadow: 0 0 0 0.5vh white inset;
}

#addon {
   width: 90vh;
   margin: auto;
   padding-left: 10%;
   padding-right: 10%;
   background: rgba(0, 0, 0, 0.60);
}

.logo {
   height: 14vh;
   width: 14vh;
   margin: auto;
   margin-bottom: 3vh;
}

.logo img {
   width: 100%;
}

.name, .version {
   display: inline-block;
   vertical-align: top;
}

.name {
   line-height: 5vh;
}

.version {
   position: absolute;
   line-height: 5vh;
   margin-left: 1vh;
   opacity: 0.8;
}

.contact {
   left: 0;
   bottom: 4vh;
   width: 100%;
   margin-top: 1vh;
   text-align: center;
}

.contact a {
   font-size: 1.4vh;
   font-style: italic;
}

.separator {
   margin-bottom: 4vh;
}

.label {
  font-size: 2.2vh;
  font-weight: 600;
  padding: 0;
  line-height: inherit;
}

.btn-group, .multiselect-container {
  width: 100%;
}

.btn {
  text-align: left;
}

.multiselect-container {
  border: 0;
  border-radius: 0;
}

.input, .btn {
  height: 3.8vh;
  width: 100%;
  margin: auto;
  margin-bottom: 10px;
  padding: 6px 12px;
  border: 0;
  border-radius: 0;
  outline: 0;
  color: #333;
  background-color: rgb(255, 255, 255);
  box-shadow: 0 0.5vh 1vh rgba(0, 0, 0, 0.2);
}
button.multiselect.dropdown-toggle.btn.btn-default {
   height: auto;
}
`;
const {listOfLists} = require("./trakt");


async function landingTemplate() {

   var trendingHTML = await listOfLists('trending').then(trending=>{
      var trendingHTML = '';
      for (let i = 0; i<trending.length;i++) {
         trendingHTML += `<option value="${trending[i].id}">${trending[i].name} by: ${trending[i].user}</option>`;
      }
      return trendingHTML;
   });
   var popularHTML = await listOfLists('popular').then(popular=>{
      var popularHTML = '';
   for (let i = 0; i<popular.length;i++) {
      popularHTML += `<option value="${popular[i].id}">${popular[i].name} by: ${popular[i].user}</option>`;
   }
      return popularHTML;
   });
   const manifest = require("./manifest.json");

   const stylizedTypes = manifest.types.map(t => t[0].toUpperCase() + t.slice(1) + (t !== 'series' ? 's' : ''));

   return `
   <!DOCTYPE html>
   <html style="background-image: url(${manifest.background});">

   <head>
      <meta charset="utf-8">
      <title>${manifest.name} - Stremio Addon</title>
      <link rel="shortcut icon" href="${manifest.logo}" type="image/x-icon">
      <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700&display=swap" rel="stylesheet">
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet" >
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.15/js/bootstrap-multiselect.min.js"></script>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.15/css/bootstrap-multiselect.css" rel="stylesheet"/>
      <style>${STYLESHEET}</style>
   </head>

	<body>
      <div id="addon">
         <div class="logo">
            <img src="${manifest.logo}">
         </div>
         <h1 class="name">${manifest.name}</h1>
         <h2 class="version">${manifest.version || '0.0.0'}</h2>
         <h2 class="description">${manifest.description || ''}</h2>

         <div class="separator"></div>
        
		<h3 class="gives">This addon has more :</h3>
         <ul>
            ${stylizedTypes.map(t => `<li>${t}</li>`).join('')}
         </ul>
		 
		 <div class="separator"></div>
         <label class="label" for="Authorize">Authorize access to your trakt account:</label>
		  <h3 class="gives">please start with this before doing any changes because all changes will be discarded when you press it.</h3><br>
		 <a id="Authorize" class="install-link" href="https://trakt.tv/oauth/authorize?client_id=18bde7dcd858c86f9593addf9f66528f8c1443ec1bef9ecee501d1c5177ce281&redirect_uri=https%3A%2F%2F2ecbbd610840-trakt.baby-beamup.club%2F&response_type=code">
          
       <button name="Authorize" id="Auth">Authorize</button>
         </a>
			<div class="separator"></div>
		 <label class="label" for="trakt_defualt">trakt list:</label><br>
		 <input type="checkbox" id="trakt_trending" value="trakt_trending" checked> trending</input><br>
		 <input type="checkbox" id="trakt_popular" value="trakt_popular" checked> Popular</input><br>
		  
       <div class="separator"></div>
       <label class="label" for="trending_lists">trakt trending lists:</label><br>
       <select id="trending_lists" class="input" name="trending_lists[]" multiple="multiple">
         ${trendingHTML}
       </select> 
        <div class="separator"></div>
        <label class="label" for="popular_lists">trakt popular lists:</label><br>
        <select id="popular_lists" class="input" name="popular_lists[]" multiple="multiple">
          ${popularHTML}
        </select> 
        <div class="separator"></div>
		  <label class="label" for="trakt_lists">trakt public lists ids:</label>
		  <h3 class="gives">please separate ids with commas or spaces only and the id for user lists is written as user_slug:list_slug (example: 35,justin:imdb-top-rated-tv-shows,52,donxy:marvel-cinematic-universe,14,giladg:latest-releases or justin:imdb-top-rated-tv-shows 35 52 14 donxy:marvel-cinematic-universe giladg:latest-releases)</h3>
		 <br>
			<input type="text" id="trakt_lists">
		 <div class="separator"></div>
		 
		 
			<label class="label" for="trakt_user">trakt list:</label><br>
		 <input type="checkbox" id="trakt_watchlist" value="trakt_watchlist"> Watchlist</input><br>
		 <input type="checkbox" id="trakt_rec" value="trakt_rec"> Recommendations</input><br>
		  
		  
		  
         <div class="separator"></div>

         <a id="installLink" class="install-link" href="#">
            <button name="Install">INSTALL</button>
         </a>
         <div class="contact">
           <p>Or paste into Stremio search bar after clicking install</p>
        </div>
        
        <div class="separator"></div>
		<h3 class="contact">
		    To contact add-on creator:
		    <a href="mailto:${manifest.contactEmail}">${manifest.contactEmail}</a>
		</h3>
		<div class="separator"></div>
      </div>
	  
	  <script type="text/javascript">

          $(document).ready(function() {
			$('#trakt_trending').click(function() {
				generateInstallLink()
			});
			$('#trakt_popular').click(function() {
				generateInstallLink()
			});
			$('#trakt_watchlist').click(function() {
				generateInstallLink()
			});
			$('#trakt_rec').click(function() {
				generateInstallLink()
			});
			$('#trakt_lists').change(function() {
				generateInstallLink()
			});
         $('#trending_lists').multiselect({ 
            nonSelectedText: 'No list',
            onChange: () => generateInstallLink()
        });
        $('#popular_lists').multiselect({ 
         nonSelectedText: 'No list',
         onChange: () => generateInstallLink()
        });
			generateInstallLink();
          });



          function generateInstallLink() {
			var lists = [];
			var data = [];
         data['lists']; 

         
         var query = window.location.search.substring(1);
			if(query){
			   var access_token = query.split('=')[1];
			}else{
            var access_token = 0;
         }

         if(access_token){
            document.getElementById('Auth').style.background = 'red';
            document.getElementById('Auth').innerHTML = 'Autherized';
         }
			
			if($('#trakt_trending').is(':checked')){
				lists.push($('#trakt_trending').val());
			}else{
			lists = lists.filter(function(value, index, arr){ 
				return value != $('#trakt_trending').val();
			})	
			}
			if($('#trakt_popular').is(':checked')){
				lists.push($('#trakt_popular').val());
			}else{
			lists = lists.filter(function(value, index, arr){ 
				return value != $('#trakt_popular').val();
			})	
         }
         if(access_token){
			if($('#trakt_watchlist').is(':checked')){
				lists.push($('#trakt_watchlist').val());
			}else{
			lists = lists.filter(function(value, index, arr){ 
				return value != $('#trakt_watchlist').val();
			})	
			}
			if($('#trakt_rec').is(':checked')){
				lists.push($('#trakt_rec').val());
			}else{
			lists = lists.filter(function(value, index, arr){ 
				return value != $('#trakt_rec').val();
			})	
			}
         }
         
			data['lists']=lists.join(',');
         data['ids'] = ($('#popular_lists').val()).concat($('#trending_lists').val(),$('#trakt_lists').val().replaceAll(' ',',')).join(',') || '';
         if(access_token){
			data['access_token']= access_token;
      }
			configurationValue = Object.keys(data).map(key => key + '=' + data[key]).join('|');
			console.log(configurationValue);
			const configuration = configurationValue && configurationValue.length ? '/' + configurationValue : '';
			const location = window.location.host + configuration + '/manifest.json'
              navigator.clipboard.writeText('https://' + location);
              installLink.href = 'stremio://' + location;
			}
			
      </script>
	  
	</body>

	</html>`
}

module.exports = landingTemplate;