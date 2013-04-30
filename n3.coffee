root = exports ? this

makeISOFromTS = (ts) ->
    d = new Date parseInt ts
    d.toISOString() 

root.getPrefixes = ->
    pa = [
        "@prefix act: <http://schemas.simonf.net/activities/core#> .",
        "@prefix dc:  <http://purl.org/dc/elements/1.1/> .",
        "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .",
        "@prefix tim: <http://www.w3.org/2006/time#> .",
        "@prefix unt: <http://www.w3.org/2007/ont/unit#> ."
    ]
    pa.join "\n"

root.convertToN3 = (doc) ->
    id = "_:#{doc._id}"
    ts = makeISOFromTS doc.updatedAt
    usr_pred = "dc:Creator"
    ts_pred = "tim:inXSDDateTime"
    cat_pred = "act:Category"
    act_pred = "act:Action"
    val_pred = "act:Value"
    qty_id = "_:#{doc._id}qty"
    unit_pred =	"act:Unit"
    qty_pred = "act:Quantity"
    unit_equiv = [
        {raw: "hr", cooked: "tim:hours"},
        {raw: "hour", cooked: "tim:hours"},
        {raw: "hours", cooked: "tim:hours"},
        {raw: "min", cooked: "tim:minutes"},
        {raw: "mins", cooked: "tim:minutes"},
        {raw: "kg", cooked: "unt:kg"},
        {raw: "mile", cooked: "unt:mile"},
        {raw: "miles", cooked: "unt:mile"},
        {raw: null, cooked: "unt:Quantity"}
    ]
    hr_min_pred = "tim:HourMinute"

    subject = id
    retval=[]
    retval.push "#{id} dc:Creator \"#{doc.user}\" ."
    retval.push "#{id} act:Category \"#{doc.category}\" ."
    retval.push "#{id} act:Action \"#{doc.action}\" ."
    retval.push "#{id} #{ts_pred} \"#{ts}\" ."
    retval.push "#{id} #{qty_pred} #{qty_id} ."
    if doc.quantity? and doc.quantity.toString().match(":") != null
        retval.push "#{qty_id} #{hr_min_pred} \"#{doc.quantity}\" ."
    else
        if (doc.quantity*10)%10 == 0
            retval.push "#{qty_id} #{val_pred} \"#{doc.quantity}\"^^xsd:integer ."
        else
            retval.push "#{qty_id} #{val_pred} \"#{doc.quantity}\" ."
        match = (trans.cooked for trans in unit_equiv when trans.raw == doc.units)
        if match.length == 1
            retval.push "#{qty_id} #{unit_pred} #{match[0]} ."
    return retval.join "\n"
