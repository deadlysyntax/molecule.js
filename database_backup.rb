require_relative 'wingman'
#initialize our array of servers to backup
servers = []
# Some of these values will be pulled from Molecule, such as databases

#Boom staging
boom =  {
    ssh_host: "", 
    ssh_user: "oli",
    ssh_pass: "",
    ssh_port: 22,
    mysql_db: "boom_gen2",
    mysql_user: "boom_prod",
    mysql_pass: "",
    remote_path: "/tmp",
    local_path: "~/Applications/admin/backup_temp"
  }

servers << boom

#cycle through each server
servers.each do |server|

  backup_process = Wingman.new( server)
  
  backup_process.back_me_up

end

