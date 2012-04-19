// Find FLASH and TODO to find those areas still needing work
(function()
{
	
	/* 
	 	-------------------------------   Passive and Active commands -------------------------------
	
		Perhaps need another setting for where the command came from
	
	 	Commands can come from 
	 	-- user input via the command line
	 	-- a clicked button on a form
	 	-- set by Molecule intitializer and stored in config initial_commands
		-- within other methods in Molecule, generally in Molecule.command_procedures methods
	
		At the moment intial commands are set to 'active', meaning that if a command's 
		callback action is set to not respond to command line, the call won't be made.
		The alternative is 'passive' which means that the callback doesn't respond to 
		command-line calls, the call to the method will still be made. This is so that
		people cannot us the command line to do things like save forms.
		
		More could be added for higher granularity
	*/ 
	
	
	/*
		--------------------------------       Dependencies       ----------------------------------
		
		Inflection
		http://code.google.com/p/inflection-js/
		
	
	*/
	
	
	/* 
		------------------------------------    Instructions     -------------------------------------
		
		To make molecule.js respond to a new resource set Molecule.config.items['resources'] during
		initialization. Such as:
		
		molecule = new Molecule({ 'resources': { clients = {}, projects = {}, tasks = {} } });
		
		At this stage the CRUD options are set to use Ruby on Rails RESTful resource system. It assumes
		client_index	GET			/client(.:format)				{:action=>"index", :controller=>"client"}
		client_inex     POST		/client(.:format)               {:action=>"create", :controller=>"client"}
		new_client 		GET			/client/new(.:format            {:action=>"new", :controller=>"client"}
		edit_client 	GET			/client/:id/edit(.:format)      {:action=>"edit", :controller=>"client"}
		client 			GET			/client/:id(.:format)           {:action=>"show", :controller=>"client"}
		client          PUT			/client/:id(.:format)           {:action=>"update", :controller=>"client"}
		client          DELETE		/client/:id(.:format)           {:action=>"destroy", :controller=>"client"}
		
		TODO this will be extended so that CRUD functionality can be set-up on initialization.
		molecule = new Molecule({ 'resources': { clients = { crud_urls: { show: "", edit: "", update: "", create: "", new: "", destroy: "", index: "" } } } });
		
		This way, a rails plugin could be set up for initializing Molecule, setting config options based on application settings
		
		Molecule assumes specific return data from ajax requests to the server 
		When saving and updating, Molecule expects a string to be returns which says 'Successfully Saved' and 'Failed to Save'.
		This could be moved out to be an intialization option
		
	*/
	
	
	/*
		---------------------------------      Test Cases     -------------------------------------
		input available command through commandline with responds_to_commandline set to true
		input available command through commandline with responds_to_commandline set to false
		input unavailable command through commandline with responds_to_commandline set to true
		input unavailable command through commandline with responds_to_commandline set to false
	
	*/
	
	
	
	
	// Initialises Molecule 
    function Molecule(config)
	{
		try
		{
	    	this.init(config);	     
		}
		catch(e)
		{
	    	throw new Error(e.message);
		}
	}
	
	/**
		Initial tasks to run on setup
	**/
    Molecule.prototype.init = function(config)
	{
			// Initialize
			this.config.init(config);
			
			// TODO run our plugin engine here
			// see https://github.com/deadlysyntax/molecule.js/issues/5
			
			// Apply standard Molecule specific event handlers to the page
			this.event_handlers.attach(this);
			// Run any initial_commands set in options
			this.standalone_processor.run( this.config.get('initial_commands'), this);
	};
	
	/**
		Configuration
		with defaults which can be set on initialization or throughout the progran
	
	**/
	Molecule.prototype.config = {
		// Defaults
		items: {
			"resources"         : {},      // These must be the pluralized version of the resource, can include rules and settings for specific resources
			"lens"              : "#lens", // TODO this could probably be deprecate - default place to append results (dont think it's used / works anymore)
			//"scope"             : "#scope",  Deprecated
			"command_line_form" : "#command_line",
			"command_line_input": "#command_line input",
			"action_buttons"    : "input[type='submit'], a.resource_button, a.helper_button", // Note- multiple, comma separated css selectors in the one string
			"initial_commands"  : [],      // array of commands to be run upon initialization
			//"target_selector"   : "#", Deprecated
			"lens_form"         : ".inner_form_wrapper form", // TODO this could probably be deprecated - default place to append results (dont think it's used / works anymore)
			"append_to"         : "", // TODO this could probably be deprecate - default place to append results (dont think it's used / works anymore)
			"alert_element"     : "#notifier p", // Which element are the error messages appended to ?
			"multiword_filter"  : /\|/g // Used to determine how to separate multiple words - perhaps deprecated I don't think this function is operating but instead uses underscores _ ?? Check
		},
		
		init: function( config )
		{
	    	// TODO initialize defaults set in plugin files
			// see https://github.com/deadlysyntax/molecule.js/issues/5
	
			for (var key in config)
				this.set(key, config[key]);
		},
		
		get: function( key )
		{
	    	if ( this.items[key] === undefined )
				throw new Error($config[key] + ' configuration item does not exist'); // TODO - load string from language file (perhaps not though, as this is system level not user level)
	    	else
				return this.items[key];
		},
		
		set: function( key, value )
		{
	    	if ( this.items[key] === undefined )
				throw new Error($items[key] + ' is not a valid configuration option'); // TODO - load string from language file (perhaps not though, as this is system level not user level)
	    	else
				this.items[key] = value;
		}
    };

	/**
		Standalone processor is used for running commands from within molecule
	**/
	Molecule.prototype.standalone_processor = {
		/**
			Loops through an array of commands and processes them
		**/
		run: function(commands, entity)
		{
			// Loop through all the commands set in initial_commands 
			$.each( commands, function(key, command)
			{
				// and execute them
				entity.command.analyze( command , entity, 'active' );
			});
		}
	}

	/**
			Handles Commands 
	
	**/
	Molecule.prototype.command = {
		/**
			A place to store the returned data from calls to the server
		
		**/
		dom_data_store: "",
		
		/**
			Syntax analysis populates these values which are then used by the command procedures
		
		**/
		// TODO also load these from plugin files
		action: {
			'procedure'          : '', // such as show new create edit destroy 
			'resource_id'        : '',
			'acts_on'            : '', // the resource we're working on
			'append_to'          : '', // dom element to append the result of ajax requests to
			'to_empty'           : '', // dom element to empty
			'to_remove'          : '', // dom element to remove
			'to_hide'            : '', // dom element to hide
			'to_unhide'          : '', // dom element to unhide
			'order'              : '', // TODO check out the use of this
			'to_extract_from'    : '', // dom element - a css style selector for which form element to use POST data from
			'data'               : '', // Stores the serialized data extracted from to_extract_from for passing through our ajax request
			'post_command_chain' : [], // Becomes an array of commands to run in succession - this is accomplished with the 'then' command
			'dom_data'           : '', // Stores the result from ajax calls to be appended to the dom if amny exists
			'element_to_replace' : '', // dom element - a css style selector for specifying an element to be relpaced 
			'replace_with'       : '', // string of html  
			'where'              : [] // stores the clause passed to Molecule.prototype.helper.build_where_clause()
		},
		
		/**
		 		Analyze checks if a command submited by a chemist exists and if so, run the command
		
		**/
		analyze: function( command, entity, command_line_status )
		{
			// Extract the first command and add the next command to the post command chain.
			first_command = entity.command.extract_commands( command, entity );
			// Sets command.action's based on user input
			entity.command.check_command_against_keywords( first_command, entity );
			// If the command exists run it
			if( Object.prototype.toString.call( entity.command_procedures[ entity.command.action.procedure ] ) == '[object Object]' )
			{
				// Don't let certain commands be through the command line, such as resource editing which relies on form data. 
				// responds_to_commandline can be set as an initialization option
				if( entity.command_procedures[ entity.command.action.procedure ].responds_to_commandline == 'no' && command_line_status == 'active')
				{
					entity.helper.notify("Invalid command - this command cannot be run through the command-line.", 'error', entity);
				}
				else
				{
					// TODO add filter here for run engine for compiling the object passed in to the following act() method
					// this will allow us to set both defaults and run extensions loaded from plugins
					// see https://github.com/deadlysyntax/molecule.js/issues/5
					
					// Run the command with the given paramters
					entity.command_procedures[ entity.command.action.procedure ].act( 
					{
						procedure           : entity.command.action.procedure,
						acts_on             : entity.command.action.acts_on, // Pluralize
						append_to           : ( entity.command.action.append_to != "" ) ? entity.command.action.append_to : entity.config.get('append_to'),
						resource_id         : entity.command.action.resource_id,
						to_empty            : ( entity.command.action.to_empty != "" ) ? entity.command.action.to_empty : entity.config.get('lens'),
						to_remove           : entity.command.action.to_remove,
						order               : entity.command.action.order,
						data                : false,
						to_extract_from     : ( entity.command.action.to_extract_from != "" ) ? entity.command.action.to_extract_from : entity.config.get('lens_form'),
						post_command_chain  : entity.command.action.post_command_chain,
						element_to_replace  : entity.command.action.element_to_replace,
						replace_with        : entity.command.action.replace_with,
						to_hide             : entity.command.action.to_hide,
						to_unhide           : entity.command.action.to_unhide,
						clause              : entity.command.action.where,
						dom_data            : entity.command.action.dom_data
					}, entity );
					// Clear the command actions, all clean for our next command
					entity.command.clear(entity);
				}	
			}
			else
			{
				entity.helper.notify("Invalid command - procedure: "+ entity.command.action.procedure +" doesn't exist", 'error', entity);
			}
		},
		
		/**
				Runs through sections of the command (seperated by spaces) and if the section
				matches our defined syntax, set certain variables based on that syntax before
				running the command operations

		**/
		check_command_against_keywords: function( command, entity )
		{
			// Place all the words into an array to check against our keyword library
			command_elements   = command.split(" ");
			//element            = command_elements.length;
			// Use for loop instead of reverse-while because the order is important
			for( element = 0; element < command_elements.length; element++ ) 
			{
				// Check that the command keyword is part of Molecule's syntax library
				if( Object.prototype.toString.call( entity.syntax[ command_elements[element] ] ) == '[object Function]')
				{
					// Run the callback associated with that keyword function
					entity.syntax[ command_elements[element] ]( element, command_elements, entity );
				}
			}
		},
		
		/**
		
		
		**/
		extract_commands: function( command, entity )
		{
			// Split the command so we can syphon through it's keywords
			command_elements = command.split(" ");
			// Begin by creatng our returned command string
			initial_command = "";
			for( key = 0; key < command_elements.length; key++ )
			{
				// If we hit 'then' put the rest of the elements into the chain and get out of here
				if( command_elements[ key ] == 'then' )
				{
					// Start building the next command
					chained_command = "";
					for( index = key + 1; index < command_elements.length; index++ )
					{
						chained_command += command_elements[ index ] + " ";
					}
					entity.command.action.post_command_chain.push( chained_command );
					break;
				}	
				// Set our initial command
				initial_command += command_elements[ key ] + " ";
			}
			return initial_command;
		},
		
		/**
				Searches through our specified resources and creates the html used to build a 
				command for showing the matching resource.
		
		**/
		scout:  function( command, entity )
		{
			// Separate by spaces, the search function assumes: [0]resource [1]query
			command_elements = command.split(" ");
			resource         = command_elements[0];
			
			// Check if the query matches one of our resources and if the searchable property is set to true
			if( entity.config.get('resources')[ entity.helper.pluralize( resource ) ] != undefined && entity.config.get('resources')[ entity.helper.pluralize( resource ) ].searchable )
			{
				// Initialize ajax call parameters
				parameters                 = [];
				parameters['acts_on']      = resource;
				parameters['query_string'] = "";
				// Combine anything after the first command element to be part of the same search query
				for( key = 1; key < command_elements.length; key++)
					parameters['query_string'] += command_elements[key] + " ";
				// Strip white space from the beginning and end of row
				// TODO also check for unwanted characters
				parameters['query_string'] = $.trim( parameters['query_string'] );
				// Call the search functionality, but don't wanna be sending no white space
				if( parameters['query_string'] != "" && parameters['query_string'] != " " )
					entity.command_procedures['search'].act( parameters, entity );
			}
		},
		
		/**
				Preps our entity object and command chain for sending to the standalone processor
		
		**/
		post_command_processor: function( post_commands, entity )
		{
			// Clear our command data because we no longer need it
			entity.command.clear(entity);
			// Run post commands
			if( post_commands.length > 0 )
				entity.standalone_processor.run( post_commands, entity );	
		},
		
		/**
				Reset the command actions - giving us a clean slate for the next command
		
		**/
		clear: function( entity )	
		{
			// Reset the command.actions
			$.each( entity.command.action, function( key, value )
			{
				// Depending on object type - Strings
				if( Object.prototype.toString.call( entity.command.action[key] ) == '[object String]')
					entity.command.action[key] = "";
				// Arrays
				if( Object.prototype.toString.call( entity.command.action[ key ] ) == '[object Array]')	
					entity.command.action[key] = [];
			});
		},	
	};
	
	
	
	
	
	Molecule.prototype.command_procedures = {

		/**
			Produces the form for creating a new resource
		
		**/
		new: 
		{
			responds_to_commandline  : 'yes',
			act                      : function( parameters, entity )
			{
				parameters['url']              = entity.helper.singularize( parameters['acts_on'] ) + '/' + parameters['procedure'];
				parameters['type']             = "GET";
				//parameters['to_extract_from']  = false; // TODO I don't think this is the best solution for muting the value
				
				entity.command_procedures.conduct_request( parameters, entity );
			}
		},

		/**
			Handles the submission of a form for creating a new resource	
		
		**/
		create: 
		{
			responds_to_commandline   : 'no',
			act                       : function( parameters, entity )
			{
				parameters['url']              = entity.helper.singularize( parameters['acts_on'] );
				parameters['type']             = "POST";
				parameters['success_message']  = entity.helper.singularize( parameters['acts_on'] ) + " created.";
				parameters['data']             = ( parameters['to_extract_from'] )  ? $( parameters['to_extract_from'] ).serialize() : false;
				
				entity.command_procedures.conduct_request( parameters, entity );
			}
		},

		/**
			Displays a resource or resources
		
		**/
		show:
		{
			respond_to_commandline    : 'yes',
			act                       : function( parameters, entity )
			{
				parameters['url']              = entity.helper.singularize( parameters['acts_on'] );
				parameters['type']             = "GET";
				parameters['data']             = ( parameters['clause'] ) ? entity.helper.build_where_clause( parameters['clause'] ) : false;
				//parameters['to_extract_from']  = false;
				//console.log(parameters['clause']);

				entity.command_procedures.conduct_request( parameters, entity );

			}	
		},
		
		/**
			Produce a form for updating a resource
		
		**/
		edit:
		{
			respond_to_commandline : 'no',
			act: function( parameters, entity )
			{
				parameters['url']              = entity.helper.singularize( parameters['acts_on'] ) + "/" + parameters['resource_id'] + "/edit";
				parameters['type']             = "GET";
				//parameters['to_extract_from']  = false; // TODO I don't think this is the best solution for muting the value
				
				entity.command_procedures.conduct_request( parameters, entity );
			}
		},

		/**
			Perform the update on a resource
		
		**/
		update:
		{
			respond_to_commandline : 'no',
			act: function( parameters, entity )
			{
				parameters['url']              = entity.helper.singularize( parameters['acts_on'] ) + '/' + parameters['resource_id'];
				parameters['type']             = "PUT";
				parameters['success_message']  = entity.helper.singularize( parameters['acts_on'] ) + " updated.";
				parameters['data']             = ( parameters['to_extract_from'] )  ? $( parameters['to_extract_from'] ).serialize() : false;

				entity.command_procedures.conduct_request( parameters, entity );
			}
		},
		
		/**
			Search for elements
		
		**/
		search:
		{
			act: function( parameters, entity)
			{
				parameters['url']                = 'search';
				parameters['type']               = 'GET';
				// TODO if there are issues with searching resource, it might have something to do with the pluralization of acts_on which happens in the scout function
				parameters['data']               = 'query=' + parameters['query_string'] + '&resource=' + parameters['acts_on'];
				parameters['async']              = true;
				parameters['post_command_chain'] = [];
				parameters['post_command_chain'].push('replace #search_results with result');
				
				entity.command_procedures.conduct_request( parameters, entity );
			}
		},
		
		/**
			Kills a resource
			
		**/
		destroy:
		{
			respond_to_commandline : 'no',
			act: function( parameters, entity )
			{
				parameters['url']              = entity.helper.singularize( parameters['acts_on'] ) + '/' + parameters['resource_id'];
				parameters['type']             = "DELETE";
				
				entity.command_procedures.conduct_request( parameters, entity );
			}
		},
		
		
		/**
			Simply empties the contents of a specified element. 
			Defaults to lens
			
		**/
		empty:
		{
			respond_to_commandline : 'yes',
			act: function( parameters, entity )
			{
				to_empty = parameters['to_empty'];
				$( to_empty ).html('');
				
				if( parameters['post_command_chain'].length > 0 )
					entity.command.post_command_processor( parameters['post_command_chain'], entity );
			}
		},
		
		/**
			Simply removes a specified element. 
			Defaults to lens
			
		**/
		remove:
		{
			respond_to_commandline : 'yes',
			act: function( parameters, entity )
			{
				to_remove = parameters['to_remove'];
				$( to_remove ).remove();
				
				if( parameters['post_command_chain'].length > 0 )
					entity.command.post_command_processor( parameters['post_command_chain'], entity );
			}
		},
		
		/**
			Append data to a given element
		
		**/	
		append:
		{
			respond_to_commandline : 'yes',
			act: function( parameters, entity )
			{
				append_to = parameters['append_to'];
				data      = parameters['dom_data'];
				$( append_to ).append( data );
				
				if( parameters['post_command_chain'].length > 0 )
					entity.command.post_command_processor( parameters['post_command_chain'], entity );
			}
		},
		
		/**
				Set an element to display none
		
		**/
		hide:
		{
			respond_to_commandline : 'yes',
			act: function( parameters, entity )
			{
				$( parameters['to_hide'] ).hide();
				
				if( parameters['post_command_chain'].length > 0 )
					entity.command.post_command_processor( parameters['post_command_chain'], entity );
			}
		},
		
		/**
				Show an element which has a display of none
		
		**/
		unhide:
		{
			respond_to_commandline : 'yes',
			act: function( parameters, entity )
			{
				$( parameters['to_unhide'] ).show();
				
				if( parameters['post_command_chain'].length > 0 )
					entity.command.post_command_processor( parameters['post_command_chain'], entity );
			}
		},
		
		/**
			Replace element
			
		**/
		replace_element:
		{
			respond_to_commandline : 'yes',
			act: function( parameters, entity )
			{
				target_element = $( parameters['element_to_replace'] );
				// Check if we're to use the result of a previous server call
				if( parameters['replace_with'] == 'result' )
					target_element.replaceWith( $( parameters['dom_data'] ) );
				else
					target_element.replaceWith( $( parameters['replace_with'] ) ); // TODO test where / how this value can be set, not sure 
				// Run post commands
				if( parameters['post_command_chain'].length > 0 )
					entity.command.post_command_processor( parameters['post_command_chain'], entity );
			}	
		},
		
		/**
			Conducts ajax requests
		
		**/
		conduct_request: function(parameters, entity)
		{
			// Ensure that we're working on a legit resource, as set in config
			if( entity.helper.is_resource( entity.helper.pluralize( parameters['acts_on'] ), entity ) == 'yes' )
			{
				// Run ajax request
				$.ajax(
				{
					url     : parameters['url'], 
					type    : parameters['type'],
					data    : parameters['data'], 
					async   : ( parameters['async'] )     ? parameters['async']      : false,
					dataType: ( parameters['dataType'] )  ? parameters['dataType']   : 'html',
					success : function(data)
					{
						// Set our dom data for later use
						entity.command.dom_data_store = data;
						// Set Notification
						if( parameters['success_message'] && parameters['success_message'] != "" )
							entity.helper.notify( parameters['success_message'], 'notice', entity);
						// Run our post commands	
						if( parameters['post_command_chain'].length > 0 )
							entity.command.post_command_processor( parameters['post_command_chain'], entity );
					}, 
					error  : function(request, status, error)
					{
						if( parameters['failure_message'] && parameters['failure_message'] != "" )
							entity.helper.notify( parameters['failure_message'], 'error', entity);
					} 
				});
			}
			else
			{
				entity.helper.notify("Invalid command - " + parameters['acts_on'] + " is not a resource", 'error', entity);
			}
			entity.command.clear(entity);
		}
	
	}
	
	/**
		Our predefined syntax for handling commands
	
	**/
	Molecule.prototype.syntax = {

		/**
			Tells molecule to run the append command which uses the append_to 
		
		**/
		append: function( key, command_elements, entity )
		{
			entity.command.action.procedure = 'append';
		},
		
		/**
				Sets up our command.actions options for a save request
		
		**/
		create: function( key, command_elements, entity)
		{
			entity.command.action.procedure = 'create';
			entity.command.action.acts_on   = command_elements[ key + 1 ];
		},
		
		/**
			Sets up command.actions.acts_on for destroying a specific resource
		
		**/
		destroy: function( key, command_elements, entity )
		{
			entity.command.action.procedure    = 'destroy';
			entity.command.action.acts_on      = entity.helper.pluralize( command_elements[ key + 1 ] );
		},
		
		/**
			Sets up command.actions for editing a resource
		
		**/
		edit: function( key, command_elements, entity )
		{
			entity.command.action.procedure   = 'edit';
			entity.command.action.acts_on     = command_elements[ key + 1 ];
		},	
		
		/**
			Sets up command.actions.to_empty for specifying a page element to remove inner html fromm
		
		**/
		empty: function( key, command_elements, entity )
		{
			entity.command.action.procedure = 'empty';
			entity.command.action.to_empty  = command_elements[ key + 1 ];
		},
		
		/**
				Tells molecule which dom element to extract form data from 
		
		**/
		from: function( key, command_elements, entity )
		{
			entity.command.action.to_extract_from = command_elements[ key + 1 ];
		},
		
		/**
			Tells Molecule which element to hide
			
		**/
		hide: function( key, command_elements, entity )
		{
			entity.command.action.procedure  = 'hide';
			entity.command.action.to_hide    = entity.helper.filter_multiwords( command_elements[ key + 1 ], " ", entity );
		},
		
		/**
			Sets up command.actions.resource_id for working on a specific resource
		
		**/
		id: function( key, command_elements, entity )
		{
			entity.command.action.resource_id  = command_elements[ key + 1 ];
		},
		
		/**
			In allows us to specify which dom element we display the command results in
		
		**/
		in: function( key, command_elements, entity)
		{	
			// Molecule expects that the element after this command specifies which dom element place the atom
			entity.command.action.append_to = command_elements[key + 1];
		},
		
		/**
				Sets up our command.actions
		
		**/
		new: function( key, command_elements, entity )
		{
			entity.command.action.procedure = 'new';
			entity.command.action.acts_on   = entity.helper.pluralize( command_elements[ key + 1 ] );
		},
		
		/**
			Sets up command.actions.order for giving a display order
		
		**/
		order: function( key, command_elements, entity )
		{
			entity.command.action.order =  command_elements[ key + 1 ];
		},
		
		/**
			Sets up command.actions.to_empty for specifying a page element to remove from the dom
		
		**/
		remove: function( key, command_elements, entity )
		{
			entity.command.action.procedure = 'remove';
			entity.command.action.to_remove  = command_elements[ key + 1 ];
			
		},
		
		/**
			Tells molecule to replace one element with another
		
		**/
		replace: function( key, command_elements, entity )
		{
			entity.command.action.procedure            = 'replace_element';
			entity.command.action.element_to_replace   = command_elements[ key + 1 ];
		},
		
		/**
			Stores the returned data from the previous command into a storage variable
		
		**/
		result: function( key, command_elements, entity )
		{
			entity.command.action.dom_data = entity.command.dom_data_store;
		},
		
		/**
				Sets up our command.actions for show requests
		
		**/
		show: function( key, command_elements, entity)
		{
			entity.command.action.procedure = 'show';
			entity.command.action.acts_on   = command_elements[ key + 1 ];
		},
		
		/**
			Alias for the 'in' keyword
			In allows us to specify which dom element we display the command results in
		
		**/
		to: function( key, command_elements, entity)
		{	
			// Molecule expects that the element after this command specifies which dom element place the atom
			entity.command.action.append_to = command_elements[key + 1];
		},
		
		/** 
			Tells Molecule which element to unhide
			
		**/
		unhide: function( key, command_elements, entity )
		{
			entity.command.action.procedure = 'unhide';
			entity.command.action.to_unhide = entity.helper.filter_multiwords( command_elements[ key + 1 ], " ", entity );
		},
		
		/**
			Sets up command.actions for updating a resource
		
		**/
		update: function( key, command_elements, entity )
		{
			entity.command.action.procedure    = 'update';
			entity.command.action.acts_on      = entity.helper.pluralize( command_elements[ key + 1 ] );
		},
		
		/**
			Sets up an array of key => value pairs in command.action
			Assumes that the format: where 'key' is 'value'
			
		**/
		where: function( key, command_elements, entity )
		{
			key_value_pair =  
			{
				key   : command_elements[ key + 1 ],
				type  : command_elements[ key + 2 ],
				value : entity.helper.filter_multiwords( command_elements[ key + 3 ], " ", entity )
			}
			entity.command.action.where.push( key_value_pair );
		},
		
		/**
			Tells molecule which element to replace the value of the 'replace' command with
		
		**/
		with: function( key, command_elements, entity )
		{
			entity.command.action.replace_with = command_elements[ key + 1 ];
		}
		
	}
	
	/**
	
		Specify jQuery event handlers
	
	
	**/
	Molecule.prototype.event_handlers = {
		
		/**
				Set's up our basic event handlers
		
		**/
		attach: function(entity)
		{
			// This stops the command line form from submitting
			$( entity.config.get('command_line_form') ).submit( function(){ return false; } );

			// Listens for any action on the command line interface -- note didn't use submit because we want to handle other input keys in the future
			$( entity.config.get('command_line_input') ).keyup(function(e) 
			{
				// listen for key 13 - 13 is the return key
				if( e.which == 13 )
				{
					// Some commands need to ignore command-line entries, 
					// and only come from other forms, such as create and delete
					value = $(this); // Keep it in here so we don't have to look more than once
					entity.command.analyze( value.attr('value') , entity, 'active' ); // Analyze the commands
					value.val('');	// Clear the search field
					// TODO - feature - store search history so that the up and down button will replace what's in the command line
				}
				else
				{
					entity.command.scout( $(this).attr('value'), entity );
				}
				//console.log("TODO - this means there is no key press options for this key. Do nothing");	
			});

			// Acts on any forms submitted within the private_lab
			$( entity.config.get('action_buttons') ).live('click', function(e)
			{
				e.preventDefault();
				entity.command.analyze( $(this).attr('data-command'), entity, 'passive' );
				// Otherwise do nothing	
			});
		}
	}
	
	/**
	
	
	**/
	Molecule.prototype.helper = {
		
		/**
			Self explainatory
			Uses the inflection library
		
		**/
		singularize: function( term )
		{	
			return term.singularize();
		},
		
		/**
			Add plurailty to a term
			Uses the inflection library
		
		**/
		pluralize: function( term )
		{
			return term.pluralize();
		},
		
		/**
				Check if the resource we're trying to access is available
		
		**/
		is_resource: function( expected_resource, entity )
		{
			// No by default
			result = 'no';
			// Resources is an object containing objects set in config
			set_resources = entity.config.get('resources');
			// Make sure the resource exists
			if( Object.prototype.toString.call( set_resources[expected_resource] ) == '[object Object]' )
				result = 'yes';
			
			return result;
		},
		
		/**
			Adds messages to the page
		
		**/
		notify: function( message, type, entity )
		{
			$( entity.config.get('alert_element') ).html( message ).attr('class', '').addClass( type );
			
			window.setTimeout(function()
			{
				$( entity.config.get('alert_element') ).removeClass( type ).html('');
			},
			4000
			);
		},
		
		/**
			Swap out syntaxical characters
			
		**/
		filter_multiwords: function( term, new_character, entity )
		{
			// We use | (pipes) to seperate multiple worded resources
			return term.replace( entity.config.get('multiword_filter'), new_character );
		},
		
		/**
			Creates a where clause string from an array of clauses
			
		**/
		build_where_clause: function( clauses, entity )
		{
			// Extracts the clauses and format into rails readable data
			query_string      = "";
			length            = clauses.length;
			$.each( clauses, function( key, value )
			{
				query_string += "clause%5B" + key + "%5Bkey%5d%5d=" + value['key'] + "&";
				query_string += "clause%5B" + key + "%5Btype%5d%5d=" + value['type'] + "&";
				query_string += "clause%5B" + key + "%5Bvalue%5d%5d=" + value['value'];
				if(key < length -1)
					query_string += "&";
			});
			return query_string;
		}
			
	}
	window.Molecule = Molecule;
})();