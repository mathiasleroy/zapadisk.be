// Pace.start();
	Pace.stop();
	// 4986/5000
	// 890 357 estimated optimal possibilities
	
	var nRuns		= 1;
	var nTeams		= 2;
	var weights;
	var nPlayers	= 30;
	var r			= 10000; // rounding factor
	
	var criteria = ['Attendance', 'Gender', 'Level', 'Attendance/Gender'];
	$('#outputSection').hide();
	
	
	
	// PRESS THE SUBMIT PLAYERS LIST BUTTON --------------------------------
	$('#submitButton').on('click', function () {
		var rawData = $('#textarea1').val();
			
		
		if (rawData==='') console.log('No Data');
		else {
			
			Pace.restart();
			
			// GET VALUES FROM FORM ---------------
			nRuns = $('#nruns').val() || 50;
			console.log('nRuns', nRuns);
			nTeams = $('#nteams').val() || 2;
			console.log('nTeams', nTeams);
			weights = $('#weights').val() || "[3, 3, 3, 1]";
			weights = weights.replace('[', '').replace(']', '').split(',').map(Number);
			console.log('weights', weights);
	
	
			// HIDE FIRST VIEW ---------------
			$('#inputSection').hide();
			setTimeout(function() { // this hack  allows the hide to execute and Pace to start
				$('#outputSection').slideDown('slow');
			
				// PARSE DATA FROM Tab-Separated-Values
				var data = Papa.parse(rawData, { // http://papaparse.com/docs#config
					delimiter: '\t',
					header: false,
					dynamicTyping: true,
				});
				
				
				window.nDays = data.data[0].length - 3; // total number of cols -name -level -gender
				// console.log(nDays);
				
				// concat attendance days into 1 array
				data.data.forEach(function(d,i){
					var attendance=[];
					for(i=3;i<=(3+nDays);i++){
						if (d[i] != undefined) attendance.push(d[i]);
					}
					d[3] = attendance;
					d.splice(4,(4+nDays)); // from where you want to delete, how much cols to delete
				});
				// console.log(data.data[0]);

				// remove empty lines
				data.data = data.data.filter( (v,i) => v[0] != '' );
				// remove players with zero attendance, they won't change the results but add unnecessary complexity
				data.data = data.data.filter( (v,i) => !arrays_equal(v[3], v[3].map(v=>0)) );
				
				
				// RUN THE MODEL MULTIPLE NRUNS ----------------------
				window.allHashes = [];
				for(iii=0;iii<nRuns;iii++){
					var response = teamGenerator(data.data);
					allHashes.push(response);
				}
				
				
				// RUN THE MODEL AGAIN UNTIL WE MAKE THE BEST TEAM WE EVER HAD ----------------------
				console.log('-- finished nruns --');
				console.log('bestSumScore ', bestSumScore);
				var hash=[0,0,0, Number.POSITIVE_INFINITY];
				var ii=0;
				while (hash[3]>bestSumScore){
					hash = teamGenerator(data.data);
					// console.log('sumScore=', hash[3]);
					ii++;
					if (ii>(20+nRuns)) {
						console.log('infinite loop');
						break;
					}
				}
				console.log('final SumScore ', hash[3]);
				
				// DISPLAY RESULTS ----------------------
				
				// RESET HTML DISPLAY ---------------------------------
				$('#playersSummary').html('');		// A
				$('#playersRows').html('');			// B
				$('#teamsSummary').html('');		// D
				$('#teamsDetails').html('');		// C
				$('#multipleRunsSummary').html('');	// E
				
				
				// A)
				// DISPLAY PLAYERS SUMMARY ---------------------------------
				var content = '\
				<ul class="dashed">\
					<li class="collection-item">' + nPlayers + ' players</li>\
					<li class="collection-item">Attendance: ' + totalScore.attends.join(' / ') + ' per day</li>\
					<li class="collection-item">Gender: ' + totalScore.nWomen + ' <span class="bigger">&#9792;</span> / ' + totalScore.nMen + ' <span class="bigger">&#9794;</span></li>\
					<li class="collection-item">Mean Level: ' + totalScore.level_mean + ' </li>\
					<li class="collection-item">Gender dif./day: ' + totalScore.attendsGenderDiff.join(' / ') + ' per day</li>\
					';
				if (nTeams===2) { // POSSIBLE COMBINATIONS 
					// C(n,r) = C(30,15) = 155 117 520 = n!/(r!(n−r)!)
					var twoTeamsCombinations = Math.round( fact(nPlayers) / ( fact(teams[0].length) * fact(nPlayers - teams[0].length) ) );
					content += '<li class="collection-item">Combinations: ' + numberWithSpaces(twoTeamsCombinations) + '</li>';
				}
				content += '</ul>';
				$('#playersSummary').append(content);
				
				
				// B)
				// DISPLAY PLAYERS IN HTML TABLE ---------------------------------
				players.sort(); // sort alphabetically
				players.forEach(function(d,i){
					$('#playersRows').append('<tr><td>'+d[0]+'</td><td>'+d[1]+'</td><td>'+d[2]+'</td><td>'+d[3]+'</td></tr>');
				});
				
				
				// C)
				// DISPLAY THE TEAMS ---------------------------
				teams.forEach(function(d,i){
					// get the score of this team
					score = scoreTeam(d);
					
					// sort alphabetically
					d.sort();
					
					// get players list
					var playersList = d.map( v => v[0] ).join(', '); // all players names in one single string
					
					var content = '<h5>Team '+ (i+1) +'</h5>';
					content += '\
					<ul class="dashed">\
						<li class="collection-item">' + d.length + ' players</li>\
						<li class="collection-item">Attendance: ' + score.attends.join(' / ') + ' per day</li>\
						<li class="collection-item">Gender: ' + score.nWomen + ' <span class="bigger">&#9792;</span> / ' + score.nMen + ' <span class="bigger">&#9794;</span></li>\
						<li class="collection-item">Mean Level: ' + score.level_mean + ' </li>\
						<li class="collection-item">Gender dif./day: ' + score.attendsGenderDiff.join(' / ') + ' per day</li>\
					</ul>';
					content += '<blockquote class="small">' + playersList + '</blockquote>';
					$('#teamsDetails').append(content);
				});
				
				
				// D)
				// DISPLAY TEAM DIFFERENCES ---------------------------------
				var content = '<ul class="dashed">';
				criteria.forEach( (d,i) => {
					content += '<li class="collection-item">'+d+': ' + eScore_last[i] + ' difference</li>';
					//  (theoric best='+bestEScorePossible[i]+')
				});
				content += '<li class="collection-item">Score: ' + eScore_last_sum + '';
				if (iii>20) content += ' (empiric best=' + bestSumScore + '';
				content += '</li>';
				content += '</ul>';
				$('#teamsSummary').append(content);

				
				// E)
				// DISPLAY MULTIPLE RUNS RESULTS -----------------------------
				if (nRuns>1) {
					
					// console.log(allHashes)
	
					var maxSwaps = Math.max.apply(Math, allHashes.map( v => v[1]) );
					
					var uniqueArray = allHashes
							.map( v => v[0]) // keep team hash
							.filter(function(item, pos, self) { // remove duplicates
								return self.indexOf(item) == pos;
							});
					var sumEScores = allHashes
							.map( v => v[3]) // keep only 4th column = sumEScores
							;
					// console.log(sumEScores);
					// console.log(Math.min(...sumEScores));
					console.log('unique sumEScores', sumEScores.reduce( (r,k) => {r[k]=1+r[k]||1; return r;},{})); // frequencies
					
					if (nRuns>=500) {
						// COMPUTE THE ESTIMATED TOTAL -----------------------------
						// https://math.stackexchange.com/questions/75758/estimate-the-size-of-a-set-from-which-a-sample-has-been-equiprobably-drawn?newreg=58581a9ae91a4fb387adb9fddd521772
						var hashes = allHashes.map( v => v[0]);
						var frequencies = hashes.reduce( (r,k) => {r[k]=1+r[k]||1; return r;},{});
						
						// filter object :
						Object.filter = (obj, predicate) =>
							Object.keys(obj)
							.filter(key => predicate(obj[key]))
							.reduce( (res, key) => (res[key] = obj[key], res), {} );
							
						var oneOccurence = Object.filter(frequencies, score => score === 1); 
						
						var uniques = hashes.filter(function(item, pos, self) { // remove duplicates
							return self.indexOf(item) == pos;
						});
						// var estimatedTotal = 217/(1-(114/368)); 
						var estimatedTotal = Object.keys(uniques).length/(1-(Object.keys(oneOccurence).length/Object.keys(hashes).length)); 
						console.log(estimatedTotal);
					}
					
					// DRAW -----------------------------
					var content = '\
						<h5>Multiple Runs Result</h5>\
						<ul class="dashed">\
							<li class="collection-item">' + nRuns + ' runs</li>\
							<li class="collection-item">' + maxSwaps + ' max swaps</li>\
						';
					criteria.forEach( (d,i) => {
						content += '<li class="collection-item">' + Math.min.apply(Math, allHashes.map( v => v[2][i]) ) + '–'+ Math.max.apply(Math, allHashes.map( v => v[2][i]) ) + ' ' + d + ' difference</li>';
					});
					content += '<li class="collection-item">' + uniqueArray.length + ' unique combinaisons</li>';
					
					if (nRuns>=500) content += '<li class="collection-item">' + numberWithSpaces(Math.round(estimatedTotal)) + ' estimated optimal possibilities</li>';
					content += '<li class="collection-item">best score : ' + bestSumScore + '</li>';
					content += '</ul>';
					$('#multipleRunsSummary').append(content);
					
				} // end if (nRuns>1) 
				
			}, 200); // end hack setTimeout
		} // end else (rawData!=='')
	});
	
	var reset = function(){
		$('#outputSection').slideUp('slow');
		$('#inputSection').slideDown('slow');
		$('#textarea1').val('');
		setTimeout(function() {
			$('#textarea1').focus();
			$('#textarea1').trigger('autoresize');
		}, 0);
	}
	
	
	// FUNCTIONS =========================================================
	
		function fillBuoc(){
			$('#textarea1').val('\
			');
			setTimeout(function() {
				$('#textarea1').focus();
				$('#textarea1').trigger('autoresize');
			}, 0);
		}
		
		function fillRandom(){
			// GENERATE FAKE DATA ---------------------------------
			// var players = [];
			var players = '';
			var firstNames1 = ['Aaron', 'Abdallah', 'Abel', 'Achille', 'Adam', 'Adel', 'Adele', 'Adem', 'Adrien', 'Adèle', 'Agathe', 'Ahmed', 'Alban', 'Albane', 'Alessio', 'Alex', 'Alexandra', 'Alexandre', 'Alexia', 'Alexis', 'Ali', 'Alice', 'Alicia', 'Alix', 'Aliya', 'Aliyah', 'Alya', 'Alyssa', 'Amandine', 'Amaury', 'Ambre', 'Amel', 'Amina', 'Aminata', 'Amine', 'Amir', 'Amira', 'Amélia', 'Amélie', 'Ana', 'Anais', 'Anas', 'Anatole', 'Anaé', 'Anaëlle', 'Anaïs', 'Andrea', 'Andréa', 'Ange', 'Angelo', 'Anis', 'Anissa', 'Anna', 'Anouk', 'Anthony', 'Antoine', 'Anton', 'Antonin', 'Apolline', 'Aria', 'Armand', 'Arsène', 'Arthur', 'Ashley', 'Asma', 'Assia', 'Assya', 'Aubin', 'Auguste', 'Augustin', 'Augustine', 'Aurore', 'Ava', 'Axel', 'Axelle', 'Aya', 'Ayden', 'Aylan', 'Aymen', 'Aymeric', 'Ayoub', 'Aïcha', 'Baptiste', 'Basile', 'Bastien', 'Benjamin', 'Bilal', 'Bilel', 'Bryan', 'Bérénice', 'Calie', 'Camille', 'Camélia', 'Candice', 'Capucine', 'Carla', 'Cassandra', 'Cassandre', 'Cassie', 'Charles', 'Charlie', 'Charline', 'Charlotte', 'Charly', 'Chiara', 'Chloe', 'Chloé', 'Claire', 'Clara', 'Clarisse', 'Clemence', 'Clement', 'Cloé', 'Cléa', 'Clémence', 'Clément', 'Clémentine', 'Coline', 'Constance', 'Corentin', 'Céleste', 'Célestine', 'Célia', 'Côme', 'Damien', 'Daniel', 'Daphné', 'David', 'Diane', 'Diego', 'Dina', 'Djibril', 'Dorian', 'Dylan', 'Eden', 'Edgar', 'Edouard', 'Elena', 'Elia', 'Elias', 'Élie', 'Elif', 'Elina', 'Éline', 'Elio', 'Eliot', 'Eliott', 'Élisa', 'Élise', 'Ella', 'Ellie', 'Elliot', 'Elouan', 'Éloïse', 'Elsa', 'Elya', 'Elyas', 'Elyna', 'Élyne', 'Eléa', 'Eléna', 'Eléonore', 'Ema', 'Émile', 'Émilie', 'Émir', 'Emma', 'Emmanuel', 'Emmy', 'Emna', 'Emy', 'Enola', 'Enora', 'Enzo', 'Erwan', 'Esteban', 'Estelle', 'Ethan', 'Éva', 'Évan', 'Ewen', 'Ezio', 'Fabio', 'Fanny', 'Farah', 'Fares', 'Fatima', 'Fatoumata', 'Faustine', 'Flora', 'Florian', 'Félix', 'Gabin', 'Gabriel', 'Gabrielle', 'Garance', 'Gaspard', 'Gauthier', 'Gaël', 'Gaëtan', 'Gianni', 'Giulia', 'Giulian', 'Guillaume', 'Gustave', 'Hafsa', 'Hajar', 'Hamza', 'Hana', 'Hanaé', 'Hanna', 'Haroun', 'Hayden', 'Hector', 'Henri', 'Hortense', 'Hugo', 'Héloïse', 'Ibrahim', 'Idriss', 'Ilan', 'Ilyan', 'Ilyana', 'Ilyas', 'Ilyes', 'Imane', 'Imran', 'Imrane', 'Inaya', 'Ines', 'Inès', 'Iris', 'Isaac', 'Ismael', 'Ismaël', 'Ismaïl', 'Issa', 'Issam', 'Iyad', 'Izia', 'Jade', 'James', 'Jana', 'Jasmine', 'Jason', 'Jayden', 'Jean', 'Jeanne', 'Jenna', 'Jennah', 'Jessim', 'Joachim', 'Johan', 'Jonas', 'Jordan', 'Joseph', 'Joshua', 'Joséphine', 'Joy', 'Jules', 'Julia', 'Julian', 'Julie', 'Julien', 'Juliette', 'Justin', 'Justine', 'Kais', 'Kaïs', 'Kelly', 'Kelya', 'Kenza', 'Kenzo', 'Kevin', 'Khadija', 'Kiara', 'Kylian', 'Kélya', 'Laly', 'Lana', 'Lara', 'Laura', 'Layana', 'Lea', 'Leana', 'Leandro', 'Lena', 'Lenny', 'Leny', 'Lenzo', 'Leo', 'Leon', 'Leonie', 'Lexie', 'Leyna', 'Leïla', 'Lia', 'Liam', 'Liana', 'Lila', 'Lili', 'Lilia', 'Lilian', 'Lilou', 'Lily', 'Lilya', 'Lina', 'Line', 'Lino', 'Lisa', 'Lise', 'Lison', 'Livia', 'Livio', 'Liya', 'Loan', 'Loane', 'Logan', 'Lohan', 'Lola', 'Lorenzo', 'Loris', 'Lou', 'Louane', 'Louca', 'Louis', 'Louisa', 'Louise', 'Louison', 'Louka', 'Louna', 'Loïc', 'Loïs', 'Luca', 'Lucas', 'Lucie', 'Lucien', 'Lucile', 'Lucy', 'Luis', 'Luka', 'Lukas', 'Luna', 'Lya', 'Lyam', 'Lyana', 'Lylia', 'Lylou', 'Lyna', 'Léa', 'Léana', 'Léandre', 'Léandro', 'Léane', 'Léna', 'Léo', 'Léon', 'Léonard', 'Léonie', 'Léopold'];
			var firstNames2 = ['Madeleine', 'Mael', 'Maelys', 'Maeva', 'Mahé', 'Malak', 'Malik', 'Malo', 'Malone', 'Manel', 'Manon', 'Marc', 'Marceau', 'Marcel', 'Marcus', 'Margaux', 'Margot', 'Maria', 'Mariam', 'Marie', 'Marin', 'Marion', 'Marius', 'Marley', 'Martin', 'Marwa', 'Marwan', 'Maryam', 'Matheo', 'Mathias', 'Mathieu', 'Mathilde', 'Mathis', 'Mathys', 'Mathéo', 'Matteo', 'Matthieu', 'Mattéo', 'Matéo', 'Max', 'Maxence', 'Maxime', 'Maya', 'Mayron', 'Mayssa', 'Maé', 'Maël', 'Maëlie', 'Maëline', 'Maëlle', 'Maëly', 'Maëlya', 'Maëlyne', 'Maëlys', 'Maëva', 'Maïssa', 'Maïwenn', 'Mehdi', 'Melina', 'Melissa', 'Mellina', 'Melvin', 'Meryem', 'Mia', 'Mila', 'Milan', 'Milo', 'Mina', 'Miya', 'Mohamed', 'Mohammed', 'Morgan', 'Morgane', 'Moussa', 'Mya', 'Myla', 'Mylan', 'Myriam', 'Mélina', 'Méline', 'Mélissa', 'Nael', 'Nahel', 'Nahil', 'Naomi', 'Naomie', 'Nassim', 'Nathan', 'Nathanaël', 'Naya', 'Nayla', 'Naël', 'Naëlle', 'Naïl', 'Naïla', 'Naïm', 'Neyla', 'Nicolas', 'Nina', 'Nino', 'Ninon', 'Noa', 'Noah', 'Noam', 'Noe', 'Noham', 'Nolan', 'Nolann', 'Nolhan', 'Nora', 'Norah', 'Nour', 'Noé', 'Noélie', 'Noémie', 'Nélia', 'Octave', 'Océane', 'Olivia', 'Omar', 'Oscar', 'Owen', 'Pablo', 'Paul', 'Pauline', 'Pierre', 'Quentin', 'Rachel', 'Rafael', 'Rafaël', 'Rania', 'Raphael', 'Raphaël', 'Raphaëlle', 'Rayan', 'Rayane', 'Robin', 'Romain', 'Romane', 'Romy', 'Roméo', 'Rose', 'Roxane', 'Ruben', 'Ryan', 'Sacha', 'Safa', 'Safiya', 'Salma', 'Salomé', 'Sami', 'Samuel', 'Samy', 'Sana', 'Sandro', 'Sara', 'Sarah', 'Sasha', 'Selena', 'Selma', 'Serena', 'Shana', 'Shanna', 'Shayna', 'Simon', 'Sirine', 'Soan', 'Sofia', 'Sofiane', 'Sohan', 'Soline', 'Sophia', 'Sophie', 'Souleymane', 'Soumaya', 'Stella', 'Suzanne', 'Swann', 'Syrine', 'Séléna', 'Tao', 'Tasnim', 'Tess', 'Tessa', 'Thaïs', 'Theo', 'Thiago', 'Thibault', 'Thibaut', 'Thiméo', 'Thomas', 'Théa', 'Théo', 'Tiago', 'Tim', 'Timeo', 'Timothé', 'Timothée', 'Timéo', 'Titouan', 'Tom', 'Tony', 'Tristan', 'Tyméo', 'Téo', 'Ulysse', 'Valentin', 'Valentina', 'Valentine', 'Victoire', 'Victor', 'Victoria', 'Vincent', 'Violette', 'Wael', 'Walid', 'Warren', 'Wassim', 'Wendy', 'William', 'Yacine', 'Yanis', 'Yann', 'Yasmine', 'Yassine', 'Ylan', 'Youcef', 'Younes', 'Youssef', 'Yusuf', 'Zakaria', 'Zoe', 'Zoé', 'Zélie', 'Élise'];
			var firstNames = firstNames1.concat(firstNames2); // just for syntax coloring, too much is bugging
			var lastNames = ['Aerts', 'Bah', 'Barry', 'Benali', 'Bertrand', 'Charlier', 'Claes', 'Claeys', 'De Clercq', 'De Smet', 'De Vos', 'Denis', 'Diallo', 'Dubois', 'Dumont', 'Dupont', 'François', 'Goossens', 'Gérard', 'Hermans', 'Jacobs', 'Janssens', 'Lambert', 'Laurent', 'Leclercq', 'Lejeune', 'Leroy', 'Maes', 'Martens', 'Martin', 'Mathieu', 'Mertens', 'Michel', 'Michiels', 'Nguyen', 'Noël', 'Pauwels', 'Peeters', 'Petit', 'Renard', 'Simon', 'Smets', 'Sow', 'Vermeulen', 'Willems', 'Wouters'];
			
			
			// generate data
			var nDays = 4;
			for (i=0; i < nPlayers; i++) {
				// var name = Math.random().toString(36).substring(2, 9);
				var name = firstNames[Math.floor(Math.random()*firstNames.length)] + ' ' + lastNames[Math.floor(Math.random()*lastNames.length)];
				var level = Math.ceil(Math.random()*10);
				var gender = Math.round(Math.random()) ? 'F' : 'M';
				// var attendance = [ Math.round(Math.random()), Math.round(Math.random()) ];
				
				// var attendance = Array.apply(null, {length: nDays}).map( v => Math.round(Math.random()));
				var attendance = Array(nDays).fill().map( v => Math.round(Math.random()));
				
				// // test repulsive factor -> add bigg number to one person and small number to another -> they will be separate
				// // attractive factor -> add bigg number to one person and small NEGATIVE number to another -> they will always be togheter
				// if (i===0) attendance.push( 100 );
				// else if (i===1) attendance.push( -100 );
				// else attendance.push( 0 );
				
				// players[name] = {'level': level, 'gender': gender};
				// players.push([name, level, gender, attendance]);
				if (i!==0) players += '\n';
				players += '' + name + '\t' + level + '\t' + gender + '\t' + attendance.join('\t') ;
			}
			$('#textarea1').val(players);
			
			setTimeout(function() { // this allow other JS to happen before this
				// set cursor in textarea and resize it (from materializecss)
				$('#textarea1').focus();
				$('#textarea1').trigger('autoresize');
			}, 0);
		}
		
		// FUNCTIONS -----------------
		function arrays_equal(a,b) { return !!a && !!b && !(a<b || b<a); }
		function fact(num) { // iterative factorial
			var rval = 1;
			for (var i = 2; i <= num; i++)
				rval *= i;
			return rval;
		}
	
		// COMPUTE SCORE FUNCTIONS ---------------------------------
		var scoreTeam = function(team){
			var members = team.length;
			var nWomen = 0;
			var nMen = 0;
			var level_sum = 0;
			var attends = Array(nDays).fill().map( v => 0); // array of zeros
			// var attendsWomen = Array(nDays).fill().map( v => 0); // array of zeros
			var attendsGenderDiff = Array(nDays).fill().map( v => 0); // array of zeros

			// console.log('----attends', attends);
			
			// loop players of this team
			team.forEach(function(d,i){ // [name, level, gender, attendance]
				// count men and women
				if (d[2]==='M') nMen++;
				else nWomen++;
				// sum of all levels
				level_sum += d[1];
				// sum number of attendances per day
				attends = attends.map((a, i) => a + d[3][i]); // 1to1 sum
				// sum number of attendances for women
				// if (d[2]!=='M') attendsWomen = attendsWomen.map((a, i) => a + d[3][i]); // 1to1 sum
				
				// wMinusM per day
				if (d[2]!=='M') attendsGenderDiff = attendsGenderDiff.map((a, i) => a + d[3][i]); // F -> +1
				else attendsGenderDiff = attendsGenderDiff.map((a, i) => a - d[3][i]); // M -> -1
			});

			// console.log('-----');
			// console.log(nWomen, nMen);
			// console.log(attends);
			// console.log(attendsWomen);
			// console.log(attendsGenderDiff);
			// console.log(team);
			// console.log( team.filter( v => v[2]=='M') );

			// var level_sum = team.reduce( (a,b) => a + b[1] , 0 ) ;// sum levels
			
			
			// var parity = Math.round( (100*nWomen/members) );
			var level_mean = Math.round( level_sum/members * r ) / r;
			
			return {'members': members,
				// 'parity': parity,
				'level_sum': level_sum,
				'level_mean': level_mean,
				// 'level_min': level_min,
				'nWomen': nWomen,
				'nMen': nMen,
				'attends': attends,
				'wMinusM': (nWomen - nMen),
				// 'attendsWomen': attendsWomen,
				'attendsGenderDiff': attendsGenderDiff,
				};
		};
		var scoreTeams = function(teams){
			var scores = [];
			teams.forEach(function(team, i) {
			    scores.push( scoreTeam(team) );
			});
			return scores;
		}
		// SWAP FUNCTION ---------------------------------
		var swapPlayers = function(teams, x, y, a, b){
			var temp = teams[x][a];
			teams[x][a] = teams[y][b];
			teams[y][b] = temp;
			swaps++;
			// console.log('swaps: ' + swaps);
		};
		// EQUITY SCORE FUNCTION ---------------------------------
		var equityScores = function(teams){
			// Compute numbers for each team
			var scores = scoreTeams(teams);
			// console.log('scores', scores);
			
			// ATTENDANCE EQUITY
			//	we don't want to minimize the difference between days between teams
			//	because if we want 2 teams, one has 30 players each day and one has 15 players each day would be good
			//	we wan to minimize the difference between teams and between days
			var attendanceEquityScore = [];
			// store the maxanceEquityScore = []; // matrix nTeams x nTeams
			var maxAtt = -1; // =
			// store the maxthe maximum number of attendance difference between 2 teams
			// var coordsOfMaxAtt = []; // the 2 teams with highest attendance disparity
			
			// GENDER EQUITY
			//	We want to measure something that can be minimised
			//	e.g. the max difference of wMinusM between two teams
			var maxGen = -Number.POSITIVE_INFINITY;
			var minGen = Number.POSITIVE_INFINITY;
			
			// LEVEL EQUITY
			var maxSkill = -Number.POSITIVE_INFINITY;
			var minSkill = Number.POSITIVE_INFINITY;
			
			// GENDER PER DAY EQUITY
			
			// a) we wan to minimize the difference between men and women per day
			// console.log('---');
			// console.log('team1', scores[0].attendsWomen);
			// console.log('team1', scores[0].attends.map(v=>v/2));
			// var genderPerDayScore2 = scores[0] // team 1
			// 		.attends.map(v=>v/2) // divide attends by two (to get expected number of women and men)
			// 		.map(function (num, idx) { // substract women numbers to get the mMinusW
			// 			return Math.abs( num - scores[0].attendsWomen[idx] );
			// 		});
			// console.log('genderPerDayScore2', genderPerDayScore2);
			// var AttPerGender = genderPerDayScore2.reduce((a,b) => a+b, 0);
			// console.log('AttPerGender', AttPerGender);
			// console.log('attendsGenderDiff', scores[0].attendsGenderDiff);
			
			// b) or we can minimize the maximum difference between women
			var genderPerDayScore = []; // we will just minimize the difference between women each day
			var maxGpD = -1; // we are looking for the max
			
			// LEVEL PER DAY
			// LEVEL PER GENDER
			
			
			scores.forEach(function(d, i) { // loop each team
				// console.log('--team'+(i+1));
				
				// GENDER
				if (maxGen<d.wMinusM) maxGen=d.wMinusM;
				if (minGen>d.wMinusM) minGen=d.wMinusM;
				
				// LEVEL
				if (maxSkill<d.level_mean) maxSkill=d.level_mean;
				if (minSkill>d.level_mean) minSkill=d.level_mean;
				
				// ATTENDANCE
				attendanceEquityScore[i] = []; // square crossmatrix, one team on each row, one on each col/
				genderPerDayScore[i] = []; // square crossmatrix, one team on each row, one on each col/
				
				scores.forEach(function(e, j) { // loop each team again
				
					attendanceEquityScore[i][j] = 0; // we will make a sum, start at zero
					genderPerDayScore[i][j] = 0; // we will make a sum, start at zero
					
					e.attends.forEach(function(f, k) { // loop each day of attendace
						// add the difference of attendance on this day, between the 2 teams currently selected
						attendanceEquityScore[i][j] += Math.abs( d.attends[k] - e.attends[k] );
						genderPerDayScore[i][j] += Math.abs( d.attendsGenderDiff[k] - e.attendsGenderDiff[k] );
					});
// xxxxxx
					// store the max, this is the actual information we are looking for
					if (attendanceEquityScore[i][j] > maxAtt) {
						maxAtt = attendanceEquityScore[i][j];
						maxGpD = genderPerDayScore[i][j];
						// coordsOfMaxAtt = [i, j];
					}
				});
			});
			// console.log('attendanceEquityScore', attendanceEquityScore);
			// console.log('genderPerDayScore', genderPerDayScore);
			// console.log('maxGpD', maxGpD);
			
			genderEquityScore = (maxGen - minGen);
			skillEquityScore = (maxSkill - minSkill);
			  
			equityScore = [
				Math.round(maxAtt*r)/r,
				genderEquityScore,
				Math.round(skillEquityScore*r)/r,
				Math.round(maxGpD*r)/r
			];
			// console.log('equityScore: ', equityScore);
			
			return equityScore;
		};
		/**
		 * Shuffles array in place. ES6 version
		 * @param {Array} a items An array containing the items.
		 */
		function shuffle(a) {
			for (let i = a.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[a[i], a[j]] = [a[j], a[i]];
			}
			return a;
		}
		String.prototype.hashCode = function() {
			var hash = 0, i, chr;
			if (this.length === 0) return hash;
			for (i = 0; i < this.length; i++) {
				chr = this.charCodeAt(i);
				hash = ((hash << 5) - hash) + chr;
				hash |= 0; // Convert to 32bit integer
			}
			return hash;
		};
		// thousand spaces separators
		function numberWithSpaces(x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
		}
	
	
	
	
	// THE MODEL ========================================================
	var bestSumScore = Number.POSITIVE_INFINITY;
	var teamGenerator = function(players){
		
		// console.log(players[0]);
		var nPlayers = players.length;
		// console.log(nPlayers + ' players' + ' / ' + players[0].length + ' features');
		
		// SHUFFLE RANDOMLY
		shuffle(players);
		
		
		// DIVIDE TABLE IN n TEAMS ---------------------------------
		// here we are just cutting in two
		var teams = [];
		for (i=0; i < nTeams; i++) {
			teams[i] = players.slice( i*nPlayers/nTeams, (i+1)*nPlayers/nTeams );
		}
		// console.log(teams);
		
		if (iii===0){
			window.totalScore=scoreTeam(players);
		}
		
		// // WHAT IS THE BEST ESCORE POSSIBLE ---------------------------------
		// if (iii===0){
			
		// 	// ATTENDANCE ---------
		// 	var bestAtt = totalScore.attends.reduce((a, b) => a + b%nTeams, 0) ; // for nDays
			
		// 	// LEVEL ---------
		// 	// xxx this is only for 2 teams;
		// 	// the best attendance diff possible is to Minize 
		// 	//  ( Math.abs( ((team0length + team1length) * x / (team0length * team1length)) - (nPlayers/team1length)  )
		// 	var foo = Array(totalScore.level_sum).fill().map((v,i)=>i); // all possible values of x
		// 	var team0length = teams[0].length; var team1length = teams[1].length;
		// 	attendanceDifferences = foo.map((v,i) => ( Math.abs( ( v * (team0length + team1length) / (team0length * team1length)) - (totalScore.level_sum/team1length)  ) ));
		// 	var minAttendanceDifference = Math.min(...attendanceDifferences); // find min of array
		// 	// console.log('min = ' + minAttendanceDifference);


		// 	// ALL ---------
		// 	window.bestEScorePossible = [
		// 		Math.round(bestAtt*r)/r , // attendance
		// 		totalScore.nWomen%nTeams + totalScore.nMen%nTeams , // gender
		// 		Math.round(minAttendanceDifference*r)/r, // level
		// 		0
		// 	];
		// 	// console.log('bestEScorePossible', bestEScorePossible);
		// }
		
		
		
		// REARRANGE TEAMS ---------------------------------

		// criteria order : 1- Attendance 2- Gender 3- Level
		// 
		// There are 2 options :
		// 1)
		//	order criteria by importance
		//	First equalize criterium1 between teams
		//	with random swaps
		//	Then crit2 without worsening crit1
		//	Then crit3 without worsening crit1 & 2
		// 2)
		//	randomize swap
		//	accept swap if
		//	 - all criteria are better
		//	 - n-1 criteria are better
		//	 - majority of criteria are better
		//	 - sum of creteria is better (give weights?)
		// 
		// -->	I'm going to try second option, I think there is less
		//		chance to get stuck into local optimum.
		//		and no need to weigh criteria
		// 
		
		
		
		// ITERATE SWAPS UNTIL WE REACH NOIMPROVMENTS FOR NTRIES ---------------------------------
		window.swaps=0;
		var noImprovements=0;
		var eScore_first;
		var	eScore_last;
		var nTries = 1000;
		var i=0;
		var eScore_last_sum;
		
		while (noImprovements<nTries ) {
		// for (i=0;i<nTries ;i++){
			var eScore1 = equityScores(teams);
			
			// store the first escore;
			if (i===0) eScore_first=eScore1;
			
			// select 2 teams, randomly
			var select_team1 = Math.floor(Math.random()*nTeams);
			var select_team2 = Math.floor(Math.random()*nTeams);
			while (select_team1 == select_team2) select_team2 = Math.floor(Math.random()*nTeams);
			// select 2 players in each team, randomly
			var select_player1 = Math.floor(Math.random()*teams[select_team1].length);
			var select_player2 = Math.floor(Math.random()*teams[select_team2].length);
			
			// SWAP ----------------------
			swapPlayers(teams, select_team1, select_team2, select_player1, select_player2);
			// ? xxx maybe check if this swap has not already been tried ?
			
			// SWAP BACK IF NO IMPROVEMENT -----------------
			eScore2 = equityScores(teams);
			// console.log(eScore1);
			// console.log(eScore2);
			// decide what is an improvement ?
			
			// // A) 
			// // only equals is never an improvement
			// // 0 good and 0 bad --> x
			// // 1 good and 1 bad --> x
			// // 2 good and 1 bad --> v
			// // 1 worse should never be
			// // if you have 3 equals then you get 1.2 improvements, not enough
			// var improvements = 0;
			// var zeroWeight = 0.9 / eScore1.length;
			// eScore1.forEach(function(d, i) {
			// 	if (eScore2[i]<d) improvements++; // add 1 each time 1 criteria gets better
			// 	else if (eScore2[i]===d) improvements = improvements + zeroWeight; // this is important
			// 	// else improvements = improvements - 0.9; // this is not so important
			// });
			// --> This method proves to be less reliable, more local optimums are found
			// escores: 
			// {
			// 	"7.9334": 11,
			// 	"6.7334": 24,
			// 	"7.7334": 6,
			// 	"9.5334": 7,
			// 	"6.9334": 12,
			// 	"13.5334": 3,
			// 	"13.9334": 3,
			// 	"7.5334": 18,
			// 	"14.9334": 1,
			// 	"12.7334": 1,
			// 	"14.3334": 1,
			// 	"11.5334": 4,
			// 	"8.7334": 2,
			// 	"17.5334": 1,
			// 	"8.9334": 1,
			// 	"15.5334": 2,
			// 	"9.9334": 2,
			// 	"11.9334": 1
			// }
			
			
			// B) we could sum the escores into one number (weighted) 
			sumEScore1 = Math.round( eScore1.map((v,i)=> v*weights[i]).reduce((a,b)=>a+b) *r)/r;
			sumEScore2 = Math.round( eScore2.map((v,i)=> v*weights[i]).reduce((a,b)=>a+b) *r)/r;
			
			
			
			// if (improvements >= 1.5) {
			if (sumEScore2 < sumEScore1) { // THIS SWAP WAS AN IMPROVEMENT -------------
				// console.log(sumEScore1, sumEScore2);
				// console.log('better');
				noImprovements=0; // reset the count
				eScore_last = eScore2;
				eScore_last_sum = sumEScore2;
				// if (arrays_equal(eScore2, bestEScorePossible)) {
				// 	// console.log('Stop: Theoric optimum', i); 
				// 	break;
				// }
			}
			else { // NO IMPROVEMENTS WITH CURRENT SWAP ----------------
				// console.log('worse');
				swaps--; 
				// swaps--;
				noImprovements++;
				swapPlayers(teams, select_team2, select_team1, select_player2, select_player1);
				// console.log('');
				// compute how much nothing happened, if too much then stop
				eScore_last = eScore1;
				eScore_last_sum = sumEScore1;
				if (noImprovements===nTries ) {
					// console.log('Stop: No improvements', i);
					break;
				}
				// else if (i+1===nTries ) console.log('max nTries  reached', i);
				
			}
			
			// since we have several optimums, an no real theorical one
			// if we have multiple runs, after a while we could say that
			// the best we had until now is probably an optimum
			// when that optimum is reached in following simulations stop before nTries
			if (iii>20 && (eScore_last_sum===bestSumScore)) {
				// console.log('Stop: Theoric optimum', i); 
				break;
			}
			
			i++;
			if (i>nTries*10) break;
		} // end swaps loop
		if (eScore_last_sum < bestSumScore) bestSumScore = eScore_last_sum;
		
		// store some results
		window.eScore_last = eScore_last;
		window.eScore_last_sum = eScore_last_sum;
		window.teams = teams;
		window.players = players;
		
		// COMPUTE UNIQUE HASHES -------------------------------
		var hashes=[]; // for each team
		sumHashes = 0;
		teams.forEach(function(d,i){
			d.sort(); // sort alphabetically
			var playersList = d.map( v => v[0] ).join(', '); // all players names in one single string
			hashes[i] = playersList.hashCode(); // this identifies 1 particular distribution of players
		});
		hashOfHashes= hashes.toString().hashCode();
		
		
		// return hashes and swaps and last eScore
		var response=[];
		response.push(hashOfHashes);			// 0 unique teams hash
		response.push(swaps - noImprovements);	// 1 total swaps
		response.push(eScore_last);				// 2 escores (array of 4)
		response.push(eScore_last_sum);			// 3 sum escores
		// console.log(response);
		return response;
	};