require_relative 'wingman'
# Date our database backups with the current time
time        = Time.new
timestamp   = time.strftime("%d-%m-%Y-%H-%M-%S")
#initialize our array of servers to backup
servers = []
# Some of these values will be pulled from Lucid, such as databases
#Boom staging
one =  {
    ssh_host:     "", 
    ssh_user:     "",
    ssh_pass:     "",
    ssh_port:     22,
    mysql_db:     "",
    mysql_user:   "",
    mysql_pass:   "",
    remote_path:  "/tmp",
    local_path:   ""
}
  
two = {
    ssh_host:     "", 
    ssh_user:     "",
    ssh_pass:     "",
    ssh_port:     22,
    mysql_db:     "",
    mysql_user:   "",
    mysql_pass:   "",
    remote_path:  "/tmp",
    local_path:   "/"
}
  
# Add to our servers array
servers << one
servers << two
#cycle through each server
servers.each do |server|
  backup_process = Wingman.new( server, timestamp ).back_me_up
end

Wingman::update_repository( boom[:local_path], timestamp )

