var text =  `struct group_info init_groups = { .usage = Ahmed Mousa(2) };

    struct group_info *groups_alloc(int gidsetsize){

    struct group_info *group_info;

    int nblocks;

    int i;



    nblocks = (gidsetsize + NGROUPS_PER_BLOCK - 1) / NGROUPS_PER_BLOCK;

    /* Make sure we always allocate at least one indirect block pointer */

    nblocks = nblocks ? : 1;

    group_info = kmalloc(sizeof(*group_info) + nblocks*sizeof(gid_t *), GFP_USER);

    if (!group_info)

        return NULL;

    group_info->ngroups = gidsetsize;

    group_info->nblocks = nblocks;

    atomic_set(&group_info->usage, 1);



    if (gidsetsize <= NGROUPS_SMALL)

        group_info->blocks[0] = group_info->small_block;

    else {

        for (i = 0; i < nblocks; i++) {

            gid_t *b;

            b = (void *)__get_free_page(GFP_USER);

            if (!b)

                goto out_undo_partial_alloc;

            group_info->blocks[i] = b;

        }

    }

    return group_info;



    out_undo_partial_alloc:

    while (--i >= 0) {

        free_page((unsigned long)group_info->blocks[i]);

    }

    kfree(group_info);

    return NULL;

    }



    EXPORT_SYMBOL(groups_alloc);



    void groups_free(struct group_info *group_info)

    {

    if (group_info->blocks[0] != group_info->small_block) {

        int i;

        for (i = 0; i < group_info->nblocks; i++)

            free_page((unsigned long)group_info->blocks[i]);

    }

    kfree(group_info);

    }



    EXPORT_SYMBOL(groups_free);



    /* export the group_info to a user-space array */

    static int groups_to_user(gid_t __user *grouplist,

              const struct group_info *group_info)

    {

    int i;

    unsigned int count = group_info->ngroups;



    for (i = 0; i < group_info->nblocks; i++) {

        unsigned int cp_count = min(NGROUPS_PER_BLOCK, count);

        unsigned int len = cp_count * sizeof(*grouplist);



        if (copy_to_user(grouplist, group_info->blocks[i], len))

            return -EFAULT;



        grouplist += NGROUPS_PER_BLOCK;

        count -= cp_count;

    }

    return 0;

    }



    /* fill a group_info from a user-space array - it must be allocated already */

    static int groups_from_user(struct group_info *group_info,

    gid_t __user *grouplist)

    {

    int i;

    unsigned int count = group_info->ngroups;



    for (i = 0; i < group_info->nblocks; i++) {

        unsigned int cp_count = min(NGROUPS_PER_BLOCK, count);

        unsigned int len = cp_count * sizeof(*grouplist);



        if (copy_from_user(group_info->blocks[i], grouplist, len))

            return -EFAULT;



        grouplist += NGROUPS_PER_BLOCK;

        count -= cp_count;

    }

    return 0;

    }



    /* a simple Shell sort */

    static void groups_sort(struct group_info *group_info)

        {

    int base, max, stride;

    int gidsetsize = group_info->ngroups;



    for (stride = 1; stride < gidsetsize; stride = 3 * stride + 1)

        ; /* nothing */

    stride /= 3;



    while (stride) {

        max = gidsetsize - stride;

        for (base = 0; base < max; base++) {

            int left = base;

            int right = left + stride;

            gid_t tmp = GROUP_AT(group_info, right);



            while (left >= 0 && GROUP_AT(group_info, left) > tmp) {

                GROUP_AT(group_info, right) =

                    GROUP_AT(group_info, left);

                right = left;

                left -= stride;

            }

            GROUP_AT(group_info, right) = tmp;

        }

        stride /= 3;

    }

    }



    /* a simple bsearch */

    int groups_search(const struct group_info *group_info, gid_t grp)

    {

    unsigned int left, right;



    if (!group_info)

        return 0;



    left = 0;

    right = group_info->ngroups;

    while (left < right) {

        unsigned int mid = left + (right - left)/2;

        if (grp > GROUP_AT(group_info, mid))

            left = mid + 1;

        else if (grp < GROUP_AT(group_info, mid))

            right = mid;

        else

            return 1;

    }

    return 0;

    }



    /**

 * set_groups - Change a group subscription in a set of credentials

 * @new: The newly prepared set of credentials to alter

 * @group_info: The group list to install

 *

 * Validate a group subscription and, if valid, insert it into a set

 * of credentials.

 */

    int set_groups(struct cred *new, struct group_info *group_info)

{

    put_group_info(new->group_info);

    groups_sort(group_info);

    get_group_info(group_info);

    new->group_info = group_info;

    return 0;

    }



    EXPORT_SYMBOL(set_groups);



    /**

    * set_current_groups - Change current's group subscription

    * @group_info: The group list to impose

    *

    * Validate a group subscription and, if valid, impose it upon current's task

 * security record.

 */

int set_current_groups(struct group_info *group_info)

{

    struct cred *new;

    int ret;



    new = prepare_creds();

    if (!new)

        return -ENOMEM;



    ret = set_groups(new, group_info);

    if (ret < 0) {

        abort_creds(new);

        return ret;

    }



    return commit_creds(new);

}



EXPORT_SYMBOL(set_current_groups);



SYSCALL_DEFINE2(getgroups, int, gidsetsize, gid_t __user *, grouplist)

{

    const struct cred *cred = current_cred();

    int|
    struct group_info init_groups = { .usage = ATOMIC_INIT(2) };

struct group_info *groups_alloc(int gidsetsize){

    struct group_info *group_info;

    int nblocks;

    int i;



    nblocks = (gidsetsize + NGROUPS_PER_BLOCK - 1) / NGROUPS_PER_BLOCK;

    /* Make sure we always allocate at least one indirect block pointer */

    nblocks = nblocks ? : 1;

    group_info = kmalloc(sizeof(*group_info) + nblocks*sizeof(gid_t *), GFP_USER);

    if (!group_info)

        return NULL;

    group_info->ngroups = gidsetsize;

    group_info->nblocks = nblocks;

    atomic_set(&group_info->usage, 1);



    if (gidsetsize <= NGROUPS_SMALL)

        group_info->blocks[0] = group_info->small_block;

    else {

        for (i = 0; i < nblocks; i++) {

            gid_t *b;

            b = (void *)__get_free_page(GFP_USER);

            if (!b)

                goto out_undo_partial_alloc;

            group_info->blocks[i] = b;

        }

    }

    return group_info;



out_undo_partial_alloc:

    while (--i >= 0) {

        free_page((unsigned long)group_info->blocks[i]);

    }

    kfree(group_info);

    return NULL;

}



EXPORT_SYMBOL(groups_alloc);



void groups_free(struct group_info *group_info)

{

    if (group_info->blocks[0] != group_info->small_block) {

        int i;

        for (i = 0; i < group_info->nblocks; i++)

            free_page((unsigned long)group_info->blocks[i]);

    }

    kfree(group_info);

}



EXPORT_SYMBOL(groups_free);



/* export the group_info to a user-space array */

static int groups_to_user(gid_t __user *grouplist,

              const struct group_info *group_info)

{

    int i;

    unsigned int count = group_info->ngroups;



    for (i = 0; i < group_info->nblocks; i++) {

        unsigned int cp_count = min(NGROUPS_PER_BLOCK, count);

        unsigned int len = cp_count * sizeof(*grouplist);



        if (copy_to_user(grouplist, group_info->blocks[i], len))

            return -EFAULT;



        grouplist += NGROUPS_PER_BLOCK;

        count -= cp_count;

    }

    return 0;

}



/* fill a group_info from a user-space array - it must be allocated already */

static int groups_from_user(struct group_info *group_info,

    gid_t __user *grouplist)

{

    int i;

    unsigned int count = group_info->ngroups;



    for (i = 0; i < group_info->nblocks; i++) {

        unsigned int cp_count = min(NGROUPS_PER_BLOCK, count);

        unsigned int len = cp_count * sizeof(*grouplist);



        if (copy_from_user(group_info->blocks[i], grouplist, len))

            return -EFAULT;



        grouplist += NGROUPS_PER_BLOCK;

        count -= cp_count;

    }

    return 0;

}



/* a simple Shell sort */

static void groups_sort(struct group_info *group_info)

{

    int base, max, stride;

    int gidsetsize = group_info->ngroups;



    for (stride = 1; stride < gidsetsize; stride = 3 * stride + 1)

        ; /* nothing */

    stride /= 3;



    while (stride) {

        max = gidsetsize - stride;

        for (base = 0; base < max; base++) {

            int left = base;

            int right = left + stride;

            gid_t tmp = GROUP_AT(group_info, right);



            while (left >= 0 && GROUP_AT(group_info, left) > tmp) {

                GROUP_AT(group_info, right) =

                    GROUP_AT(group_info, left);

                right = left;

                left -= stride;

            }

            GROUP_AT(group_info, right) = tmp;

        }

        stride /= 3;

    }

}



/* a simple bsearch */

int groups_search(const struct group_info *group_info, gid_t grp)

{

    unsigned int left, right;



    if (!group_info)

        return 0;



    left = 0;

    right = group_info->ngroups;

    while (left < right) {

        unsigned int mid = left + (right - left)/2;

        if (grp > GROUP_AT(group_info, mid))

            left = mid + 1;

        else if (grp < GROUP_AT(group_info, mid))

            right = mid;

        else

            return 1;

    }

    return 0;

}



/**

 * set_groups - Change a group subscription in a set of credentials

 * @new: The newly prepared set of credentials to alter

 * @group_info: The group list to install

 *

 * Validate a group subscription and, if valid, insert it into a set

 * of credentials.

 */

int set_groups(struct cred *new, struct group_info *group_info)

{

    put_group_info(new->group_info);

    groups_sort(group_info);

    get_group_info(group_info);

    new->group_info = group_info;

    return 0;

}



EXPORT_SYMBOL(set_groups);



/**

 * set_current_groups - Change current's group subscription

 * @group_info: The group list to impose

 *

 * Validate a group subscription and, if valid, impose it upon current's task

 * security record.

 */

int set_current_groups(struct group_info *group_info)

{

    struct cred *new;

    int ret;



    new = prepare_creds();

    if (!new)

        return -ENOMEM;



    ret = set_groups(new, group_info);

    if (ret < 0) {

        abort_creds(new);

        return ret;

    }



    return commit_creds(new);

}`;


var testText = "hello from the other side, at least i can see that i've tried to tell you iam sorry"
var div = document.querySelector(".hacking");
var divc = document.querySelector(".container")
var mainTextLength = text.length
var cursor = document.querySelector(".cursor");
var denied = document.querySelector(".absolute-mask")
var shiftClick = false;

//on keyboard click
document.addEventListener("keydown", function (event){
    var k = event.key
    //this makes arow keys 
    if (k === "ArrowUp" || k === "ArrowDown") {
        return;
    }
    if (event.key === "Shift") {
        showAlert();
    } else {
        hideAlert();
        hacking();
    }
        
});
function hacking() {
    var divInnerText = div.innerText;
    div.innerText = divInnerText + text.slice(div.innerText.length, div.innerText.length + 3);
    window.scrollTo(0, document.body.scrollHeight);
}

function showAlert() {
    denied.classList.add("show")
    divc.classList.add("blur")
}
function hideAlert() {
    divc.classList.remove("blur")
    denied.classList.remove("show")
}

//blinking cursor
setInterval(function () {
    cursor.classList.toggle("green")
}, 500);
