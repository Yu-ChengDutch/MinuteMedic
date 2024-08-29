(() => {
	const lockedColor = "#ccc";
	const unlockedColor = "#def";
	const selectedColor = "#33C3F0";

	/* DATASET */
	let nodes = new vis.DataSet([
		{ id: 1, value: 10, level: 4, label: "PONEY" },
		{ id: 2, value: 10, level: 4, label: "CRAYOLA" },
		{ id: 3, value: 10, level: 4, label: "SCHTROUMPF" },
		{ id: 4, value: 10, level: 4, label: "SAM" },
		{ id: 5, value: 20, level: 3, label: "CHEVAL" },
		{ id: 6, value: 20, level: 3, label: "ARC EN CIEL" },
		{ id: 7, value: 20, level: 3, label: "COSMONAUTE" },
		{ id: 8, value: 20, level: 3, label: "POMPIER" },
		{ id: 9, value: 40, level: 2, label: "LICORNE" },
		{ id: 10, value: 40, level: 2, label: "COSMO-POMPIER" },
		{ id: 11, value: 80, level: 1, label: "COSMO-LICORNE-POMPIER" },
	].map(n => { n.label += " \n("+ n.value +")"; return n}));
	let edges = new vis.DataSet([
		{ from: 1, to: 5, arrows: "to" },
		{ from: 2, to: 6, arrows: "to" },
		{ from: 3, to: 6, arrows: "to" },
		{ from: 4, to: 7, arrows: "to" },
		{ from: 4, to: 8, arrows: "to" },
		{ from: 5, to: 9, arrows: "to" },
		{ from: 6, to: 9, arrows: "to" },
		{ from: 7, to: 10, arrows: "to" },
		{ from: 8, to: 10, arrows: "to" },
		{ from: 9, to: 11, arrows: "to" },
		{ from: 10, to: 11, arrows: "to" },
	]);
	const container = document.getElementById("skilltree");
	const data = {
		nodes: nodes,
		edges: edges
	};
	const options = {
		interaction: {
			selectConnectedEdges: false
		},
		nodes: {
			chosen: false,
			shape: "dot",
			size: 10,
			color: lockedColor,
			font: {
				face: "Raleway, Helvetica, Arial",
				size: 11,
				color: "#666"
			},
			borderWidth: 1,
		},
		edges: {
			color: lockedColor,
			dashes: true,
			arrows :{
				to:{
					scaleFactor: 0.5
				}
			}		
		},
		layout: {
			hierarchical: {
				direction: "RL"
			}
		}
	};
	let network = new vis.Network(container, data, options);
	let wallet = 115;

	/* ********************************************************************************* */
	
	/**
		update all graph nodes with selectedParents and subTree Requirements
		change visuals based on status (values / requirements / selected)
	**/
	const buildGraphDisplay = function() {
		//update wallet display
		document.getElementById("wallet").innerHTML = wallet;


		/* recursive subTree (classic) */
		/*
		const getRSubtree = nodeId => {
			let childs = network.getConnectedNodes(nodeId, "from");
			if (childs.length > 0) {
				let subtree = childs;
				for (let i = 0; i < childs.length; i++) {
					let nodeChilds = getSubtree(childs[i]);
					if (nodeChilds) {
						subtree = subtree.concat(nodeChilds);
					}
				}
				return subtree;
			}
			return false;
		};
		*/

		/* SUBTREE */
		/* glitch subtree */
		const getSubtree = nodeId => {
			let childs = network.getConnectedNodes(nodeId, "from");
			for (let i = 0; i < childs.length; i++) {
				childs = childs.concat(network.getConnectedNodes(childs[i], "from"));
			}
			return childs;
		};

		/* glitch parentTree */
		const getParentstree = nodeId => {
			let parents = network.getConnectedNodes(nodeId, "to");
			for (let i = 0; i < parents.length; i++) {
				parents = parents.concat(network.getConnectedNodes(parents[i], "to"));
			}
			return parents;
		};

		nodes.getIds().forEach(nodeId => {
			let currNode = nodes.get(nodeId);
			
			// updating nodes with subtree
			// example using reduce
			currNode.requiredSubtree = getSubtree(nodeId).reduce( (requiredNodes, id) => { 
				const childNode = nodes.get(id);
				(childNode.selected !== true && typeof requiredNodes.find(o => o.id === childNode.id) === "undefined" && requiredNodes.push(childNode));
				return requiredNodes;
			}, []);
			
			// updating nodes with parentspath 
			// example with forEach
			let selectedParents = [];
			getParentstree(nodeId).forEach(node => {
				const parentNode = nodes.get(node);
				(parentNode.selected === true && typeof selectedParents.find(o => o.id === parentNode.id) === "undefined" && selectedParents.push(parentNode));
			});
			currNode.selectedParents = selectedParents;

			// by default mark all as available
			currNode.locked = "";
			//trigger errors for unselected nodes
			if (currNode.selected !== true){
				if (currNode.requiredSubtree.length > 0) {
					// if missing nodes in path mark as locked
					currNode.locked += "/!\\ ALERTE REQUIREMENTS /!\\ \n Pour debloquer cette compétence, il faut acquérir les compétences suivantes : \n- " + currNode.requiredSubtree.map( n => n.label.replace("\n"," ")).join("\n- ") ;
				}else if (nodes.get(nodeId).value > wallet) {
					// if not enough credit mark as locked
					currNode.locked += "/!\\ ALERTE PAUVRETÉ /!\\ \n Pas assez de crédits, il t'en reste " + wallet +"\n";
				}
			}
				
			// change node visuals
			currNode.color = {
				background: (currNode.selected === true)?selectedColor:(currNode.locked === "")?unlockedColor:lockedColor,
				highlight: {
					background: (currNode.selected === true)?selectedColor:(currNode.locked === "")?unlockedColor:lockedColor,
				},
			};
			currNode.shapeProperties = (currNode.locked === "") ? { borderDashes : false} : { borderDashes : [6,4] } ;
			currNode.refund = Math.round(currNode.selectedParents.reduce( (parentsRefund, node) => parentsRefund + node.value, currNode.value )*0.9);
			currNode.title = (currNode.selected === true)?  currNode.label +" : Compétence acquise<br/> Refund pour "+ currNode.refund +" crédits" :(currNode.locked === "")? "Acquerir "+ currNode.label +" pour "+currNode.value +" crédits" : currNode.locked.replace(/\n/g,"<br/>");
			/*
			currNode.borderWidth = (currNode.selected == true)?2:1;
			currNode.borderWidthSelected = (currNode.selected == true)?2:1;
			*/
			nodes.update(currNode);

			const connectedEdges = network.getConnectedEdges(currNode.id);
			connectedEdges.forEach(id => {
				const edge = edges.get(id);
				if(edge.to == currNode.id){
					edge.dashes = (currNode.selected === true)?false:true;
					edges.update(edge);
				}
			});
			
		});
	};

	/* EVENTS HANDLING */
	/**
		init
	**/
	network.once("stabilized", () => {
		buildGraphDisplay();
	});
	
	/**
		on click, update graph nodes selected status, handle wallet
	**/
	network.on("click", p => {
		if (p.nodes.length) {
			let currNode = nodes.get(p.nodes[0]);
			if (currNode.locked == ""){
				if (currNode.selected == true){
					if (confirm("Refund "+ currNode.refund +" crédits (-10%) pour les compétences :\n- " + currNode.label.replace("\n", "") + (currNode.selectedParents.length > 0 ? "\n- "+ currNode.selectedParents.map( n => n.label.replace("\n"," ")).join("\n- "):""))){
						currNode.selectedParents.forEach( node => {
							node.selected = false;
							nodes.update(node);
						});
						currNode.selected = false;
						wallet += currNode.refund;
					}
				}else{
					if (confirm("Acquérir la compétence :\n- " + currNode.label.replace("\n", "") +"\nIl te restera " + (wallet - currNode.value) +" crédits")){
						currNode.selected = true;
						wallet -= currNode.value;
					}
				}
				nodes.update(currNode);
				document.getElementById("wallet").innerHTML = wallet;
			}else{
				// No need to alert, those are displayed in tooltips
				// alert(currNode.locked);
			}
			buildGraphDisplay();
		}
	});
})();